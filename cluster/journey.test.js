const weaviate = require("../index");
const { createTestFoodSchemaAndData, cleanupTestFood, PIZZA_CLASS_NAME, SOUP_CLASS_NAME } = require("../utils/testData");

const EXPECTED_WEAVIATE_VERSION = "1.18.0-alpha.1"
const EXPECTED_WEAVIATE_GIT_HASH = "41f7cb9"

describe("cluster nodes endpoint", () => {
  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("get nodes status of empty db", () => {
    return client.cluster
      .nodesStatusGetter()
      .do()
      .then(nodesStatusResponse => {
        expect(nodesStatusResponse.nodes).toHaveLength(1);
        const node = nodesStatusResponse.nodes[0];
        expect(node.name).toMatch(/.+/);
        expect(node.version).toEqual(EXPECTED_WEAVIATE_VERSION);
        expect(node.gitHash).toEqual(EXPECTED_WEAVIATE_GIT_HASH);
        expect(node.status).toEqual(weaviate.cluster.NodeStatus.HEALTHY);
        expect(node.stats.objectCount).toEqual(0);
        expect(node.stats.shardCount).toEqual(0);
        expect(node.shards).toHaveLength(0);
      })
      .catch(e => fail("should not fail on getting nodes: " + e))
  });

  it("sets up db", () => createTestFoodSchemaAndData(client));

  it("get nodes status of food db", () => {
    return client.cluster
      .nodesStatusGetter()
      .do()
      .then(nodesStatusResponse => {
        expect(nodesStatusResponse.nodes).toHaveLength(1);
        const node = nodesStatusResponse.nodes[0];
        expect(node.name).toMatch(/.+/);
        expect(node.version).toEqual(EXPECTED_WEAVIATE_VERSION);
        expect(node.gitHash).toEqual(EXPECTED_WEAVIATE_GIT_HASH);
        expect(node.status).toEqual(weaviate.cluster.NodeStatus.HEALTHY);
        expect(node.stats.objectCount).toEqual(6);
        expect(node.stats.shardCount).toEqual(2);
        expect(node.shards).toHaveLength(2);
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
              break
          }
        }
      })
      .catch(e => fail("should not fail on getting nodes: " + e))
  });

  it("cleans up db", () => cleanupTestFood(client));
});
