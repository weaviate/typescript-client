import { GenericContainer, StartedTestContainer } from 'testcontainers';
import weaviate from '..';
import { WeaviateStartUpError } from '../errors';
import { Meta } from '../openapi/types';
import { DbVersion } from '../utils/dbVersion';

describe('Integration testing of the ConnectionGRPC class', () => {
  let container: StartedTestContainer;

  const getVersion = () =>
    fetch(`http://${container.getHost()}:${container.getMappedPort(8080)}/v1/meta`)
      .then((res) => res.json() as Promise<Meta>)
      .then((meta) => DbVersion.fromString(meta.version!));

  beforeAll(async () => {
    container = await new GenericContainer(`semitechnologies/weaviate:${process.env.WEAVIATE_VERSION}`)
      .withExposedPorts(8080, 50051)
      .withEnvironment({
        GRPC_MAX_MESSAGE_SIZE: '1',
      })
      .start();
  });
  it('should fail to startup due to message-size limit', async () => {
    const dbVersion = await getVersion();
    try {
      await weaviate.connectToLocal({
        host: container.getHost(),
        port: container.getMappedPort(8080),
        grpcPort: container.getMappedPort(50051),
      });
      expect(dbVersion.isLowerThan(1, 27, 0)).toBe(true); // change to 1.27.1 when it lands
    } catch (err) {
      expect(err).toBeInstanceOf(WeaviateStartUpError);
      expect((err as WeaviateStartUpError).message).toContain(
        'RESOURCE_EXHAUSTED: Attempted to send message with a size larger than 1'
      );
      expect(dbVersion.isAtLeast(1, 27, 0)).toBe(true); // change to 1.27.1 when it lands
    }
  });
});
