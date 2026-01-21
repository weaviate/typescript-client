import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Batcher } from '../../../src/collections/data/batch.js';
import { BatchObject } from '../../../src/collections/index.js';
import Connection from '../../../src/connection/grpc.js';
import weaviate, { WeaviateClient } from '../../../src/index.js';

describe('Testing of the Batch class directly', () => {
  let client: WeaviateClient;
  const collectionName = 'TestBatchObjects';

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    await client.collections.create({
      name: collectionName,
      properties: [{ name: 'text', dataType: 'text' }],
      references: [{ name: 'self', targetCollection: collectionName }],
    });
  });

  afterAll(async () => {
    await client.collections.delete(collectionName);
  });

  it('should be able to ingest one self-referencing object with vectors', async () => {
    const objects: BatchObject<any>[] = [];
    for (let i = 0; i < 2000; i++) {
      objects.push({
        collection: collectionName,
        properties: {
          text: `object ${i}`,
        },
        vectors: Array.from({ length: 128 }, () => Math.random()),
      });
    }
    const batch = new Batcher<any>();
    const { connection } = await Connection.use({
      host: 'http://localhost:8080',
      grpcAddress: 'localhost:50051',
      grpcSecure: false,
    });

    const batching = batch.start(connection);
    const id = await batch.addObject({
      collection: collectionName,
      properties: {
        text: 'object',
      },
      vectors: Array.from({ length: 128 }, () => Math.random()),
    });
    await batch.addReference({
      fromObjectCollection: collectionName,
      fromObjectUuid: id,
      fromPropertyName: 'self',
      toObjectCollection: collectionName,
      toObjectUuid: id,
    });
    batch.stop();

    await batching;
    await connection.close();

    expect(Object.keys(batch.objErrors).length).toEqual(0);
    expect(Object.keys(batch.uuids).length).toEqual(1);
    expect(Object.keys(batch.beacons).length).toEqual(1);
  });
});
