import { StartedWeaviateContainer, WeaviateContainer } from '@testcontainers/weaviate';
import weaviate from '@weaviate/node';
import { WeaviateStartUpError } from '@weaviate/core/errors';
import { Meta } from '@weaviate/core/openapi/types';
import { DbVersion } from '@weaviate/core/utils/dbVersion';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Integration testing of the ConnectionGRPC class', () => {
  let container: StartedWeaviateContainer;

  const getVersion = () =>
    fetch(`http://${container.getHost()}:${container.getMappedPort(8080)}/v1/meta`)
      .then((res) => res.json() as Promise<Meta>)
      .then((meta) => DbVersion.fromString(meta.version!));

  beforeAll(async () => {
    container = await new WeaviateContainer(`semitechnologies/weaviate:${process.env.WEAVIATE_VERSION}`)
      .withExposedPorts(8080, 50051)
      .withEnvironment({
        GRPC_MAX_MESSAGE_SIZE: '1',
      })
      .start();
    expect(container).toBeDefined();
  });
  afterAll(async () => {
    await container.stop();
  });
  it('should fail to startup due to message-size limit', async () => {
    const dbVersion = await getVersion();
    try {
      await weaviate.connectToLocal({
        host: container.getHost(),
        port: container.getMappedPort(8080),
        grpcPort: container.getMappedPort(50051),
      });
      expect(dbVersion.isLowerThan(1, 27, 1)).toBe(true);
    } catch (err) {
      expect(err).toBeInstanceOf(WeaviateStartUpError);
      expect((err as WeaviateStartUpError).message).toContain(
        'RESOURCE_EXHAUSTED: Attempted to send message with a size larger than 1'
      );
      expect(dbVersion.isAtLeast(1, 27, 1)).toBe(true);
    }
  });
});
