import weaviate, { NodesStatusResponse } from '..';

import {
  createTestFoodSchemaAndData,
  cleanupTestFood,
  PIZZA_CLASS_NAME,
  SOUP_CLASS_NAME,
} from '../utils/testData';

const EXPECTED_WEAVIATE_VERSION = '1.20.0';
const EXPECTED_WEAVIATE_GIT_HASH = '7865a4a';

describe('cluster nodes endpoint', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  it('get nodes status of empty db', () => {
    return client.cluster
      .nodesStatusGetter()
      .do()
      .then((nodesStatusResponse: NodesStatusResponse) => {
        expect(nodesStatusResponse.nodes).toBeDefined();
        expect(nodesStatusResponse.nodes).toHaveLength(1);
        if (nodesStatusResponse.nodes) {
          const node = nodesStatusResponse.nodes[0] ?? [];
          expect(node.name).toMatch(/.+/);
          expect(node.version).toEqual(EXPECTED_WEAVIATE_VERSION);
          expect(node.gitHash).toEqual(EXPECTED_WEAVIATE_GIT_HASH);
          expect(node.status).toEqual('HEALTHY');
          expect(node.stats).toBeDefined();
          expect(node.stats?.objectCount).toEqual(0);
          expect(node.stats?.shardCount).toEqual(0);
          expect(node.shards).toBeNull();
        } else {
          throw new Error('nodesStatusResponse.nodes should be defined');
        }
      })
      .catch((e: any) => {
        throw new Error('should not fail on getting nodes: ' + e);
      });
  });

  it('sets up db', () => createTestFoodSchemaAndData(client));

  it('get nodes status of food db', () => {
    return client.cluster
      .nodesStatusGetter()
      .do()
      .then((nodesStatusResponse: NodesStatusResponse) => {
        expect(nodesStatusResponse.nodes).toHaveLength(1);
        if (nodesStatusResponse.nodes) {
          const node = nodesStatusResponse.nodes[0];
          expect(node.name).toMatch(/.+/);
          expect(node.version).toEqual(EXPECTED_WEAVIATE_VERSION);
          expect(node.gitHash).toEqual(EXPECTED_WEAVIATE_GIT_HASH);
          expect(node.status).toEqual('HEALTHY');
          expect(node.stats?.objectCount).toEqual(6);
          expect(node.stats?.shardCount).toEqual(2);
          expect(node.shards).toBeDefined();
          expect(node.shards).toHaveLength(2);
          if (node.shards) {
            expect([node.shards[0].class, node.shards[1].class]).toEqual(
              expect.arrayContaining([PIZZA_CLASS_NAME, SOUP_CLASS_NAME])
            );
            for (let i = 0; i < node.shards.length; i++) {
              const shard = node.shards[i];
              expect(shard.name).toMatch(/.+/);
              switch (shard.class) {
                case PIZZA_CLASS_NAME:
                  expect(shard.objectCount).toEqual(4);
                  break;
                case SOUP_CLASS_NAME:
                  expect(shard.objectCount).toEqual(2);
                  break;
              }
            }
          } else {
            throw new Error('node.shards should be defined');
          }
        } else {
          throw new Error('nodesStatusResponse.nodes should be defined');
        }
      })
      .catch((e: any) => {
        throw new Error('should not fail on getting nodes: ' + e);
      });
  });

  it('get nodes status of only Pizza class in food db', () => {
    return client.cluster
      .nodesStatusGetter()
      .withClassName(PIZZA_CLASS_NAME)
      .do()
      .then((nodesStatusResponse: NodesStatusResponse) => {
        expect(nodesStatusResponse.nodes).toBeDefined();
        expect(nodesStatusResponse.nodes).toHaveLength(1);
        if (nodesStatusResponse.nodes) {
          const node = nodesStatusResponse.nodes[0];
          expect(node.name).toMatch(/.+/);
          expect(node.version).toEqual(EXPECTED_WEAVIATE_VERSION);
          expect(node.gitHash).toEqual(EXPECTED_WEAVIATE_GIT_HASH);
          expect(node.status).toEqual('HEALTHY');
          expect(node.stats?.objectCount).toEqual(4);
          expect(node.stats?.shardCount).toEqual(1);
          expect(node.shards).toBeDefined();
          expect(node.shards).toHaveLength(1);
          if (node.shards) {
            expect(node.shards[0].class).toEqual(PIZZA_CLASS_NAME);
            expect(node.shards[0].objectCount).toEqual(4);
            expect(node.shards[0].name).toBeDefined();
          } else {
            throw new Error('node.shards should be defined');
          }
        } else {
          throw new Error('nodesStatusResponse.nodes should be defined');
        }
      })
      .catch((e: any) => {
        throw new Error('should not fail on getting nodes: ' + e);
      });
  });

  it('cleans up db', () => cleanupTestFood(client));
});
