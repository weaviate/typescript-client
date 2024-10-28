import { GenericContainer, StartedTestContainer } from 'testcontainers';
import weaviate from '..';
import { WeaviateStartUpError } from '../errors';

describe('Integration testing of the ConnectionGRPC class', () => {
  let container: StartedTestContainer;
  beforeAll(async () => {
    container = await new GenericContainer(`semitechnologies/weaviate:${process.env.WEAVIATE_VERSION}`)
      .withExposedPorts(8080, 50051)
      .withEnvironment({
        GRPC_MAX_MESSAGE_SIZE: '1',
      })
      .start();
  });
  it('should fail to startup due to message-size limit', async () => {
    try {
      await weaviate.connectToLocal({
        host: container.getHost(),
        port: container.getMappedPort(8080),
        grpcPort: container.getMappedPort(50051),
      });
    } catch (err) {
      expect(err).toBeInstanceOf(WeaviateStartUpError);
      expect((err as WeaviateStartUpError).message).toContain(
        'RESOURCE_EXHAUSTED: Attempted to send message with a size larger than 1'
      );
    }
  });
});
