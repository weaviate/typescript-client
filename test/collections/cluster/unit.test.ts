import { describe, expect, it } from 'vitest';
import cluster from '../../../src/collections/cluster/index.js';
import { IConnection } from '../../../src/connection';

// These tests do not validate the response from Weaviate. This is because the server responses are not mapped at all by the client so are assumed to be correct.
// Instead, these tests validate that the client sends the correct requests to the server and that the responses are handled correctly.
describe('Unit testing of the client.cluster methods', () => {
  const clusterMaker = (mock: any) => cluster(mock as unknown as IConnection);
  const assert = (expected: any) => (actual: any) => expect(actual).toEqual(expected);

  it('should query the nodes correctly', () => {
    const opts = { collection: 'Collection', output: 'minimal' as const };
    const mockResult = {
      nodes: [
        {
          name: 'node1',
          status: 'HEALTHY',
          version: '1.0.0',
          gitHash: 'abc123',
          batchStats: { queueLength: 0, ratePerSecond: 0 },
          stats: undefined,
          shards: null,
        },
      ],
    };
    const mockConnection = {
      get: (path: string, expectReturnContent?: boolean | undefined) => {
        expect(path).toBe('/nodes/Collection?output=minimal');
        return Promise.resolve(mockResult);
      },
    };
    clusterMaker(mockConnection).nodes(opts).then(assert(mockResult.nodes));
  });

  it('should query the sharding state correctly for a collection with a shard', () => {
    const opts = {
      shard: 'shard',
    };
    const mockResult = {
      collection: 'Collection',
      shards: [{ shard: 'shard', replicas: ['node1', 'node2'] }],
    };
    const mockConnection = {
      get: (path: string, expectReturnContent?: boolean | undefined) => {
        expect(path).toBe(`/replication/sharding-state?collection=Collection&shard=shard`);
        return Promise.resolve(mockResult);
      },
    };
    clusterMaker(mockConnection).queryShardingState('Collection', opts).then(assert(mockResult));
  });

  it('should query the sharding state correctly for a collection without a specific shard', () => {
    const mockResult = {
      collection: 'Collection',
      shards: [
        { shard: 'shard1', replicas: ['node1'] },
        { shard: 'shard2', replicas: ['node2'] },
      ],
    };
    const mockConnection = {
      get: (path: string, expectReturnContent?: boolean | undefined) => {
        expect(path).toBe('/replication/sharding-state?collection=Collection');
        return Promise.resolve(mockResult);
      },
    };
    clusterMaker(mockConnection).queryShardingState('Collection').then(assert(mockResult));
  });

  it('should replicate a shard correctly', () => {
    const args = {
      collection: 'Collection',
      shard: 'shard',
      sourceNode: 'sourceNode',
      targetNode: 'targetNode',
      replicationType: 'COPY' as const,
    };
    const mockResult = { id: 'replication-id' };
    const mockConnection = {
      postReturn: (path: string, body: any): Promise<any> => {
        expect(path).toBe('/replication/replicate');
        expect(body).toEqual({
          collection: 'Collection',
          shard: 'shard',
          sourceNode: 'sourceNode',
          targetNode: 'targetNode',
          type: 'COPY',
        });
        return Promise.resolve(mockResult);
      },
    };
    clusterMaker(mockConnection).replicate(args).then(assert(mockResult.id));
  });

  it('should get a replication operation by ID without status history', () => {
    const id = 'replication-id';
    const mockResult = { id };
    const mockConnection = {
      get: (path: string) => {
        expect(path).toBe(`/replication/replicate/${id}?includeHistory=false`);
        return Promise.resolve(mockResult);
      },
    };
    clusterMaker(mockConnection).replications.get(id).then(assert(mockResult));
  });

  it('should get a replication operation by ID with status history', () => {
    const id = 'replication-id';
    const mockResult = { id };
    const mockConnection = {
      get: (path: string) => {
        expect(path).toBe(`/replication/replicate/${id}?includeHistory=true`);
        return Promise.resolve(mockResult);
      },
    };
    clusterMaker(mockConnection).replications.get(id, { includeHistory: true }).then(assert(mockResult));
  });

  it('should cancel a replication operation', () => {
    const id = 'replication-id';
    const mockConnection = {
      postEmpty: (path: string): Promise<void> => {
        expect(path).toBe(`/replication/replicate/${id}/cancel`);
        return Promise.resolve();
      },
    };
    clusterMaker(mockConnection).replications.cancel(id).then(assert(undefined));
  });

  it('should delete a replication operation', () => {
    const id = 'replication-id';
    const mockConnection = {
      delete: (path: string) => {
        expect(path).toBe(`/replication/replicate/${id}`);
        return Promise.resolve();
      },
    };
    clusterMaker(mockConnection).replications.delete(id).then(assert(undefined));
  });

  it('should delete all replication operations', () => {
    const mockConnection = {
      delete: (path: string) => {
        expect(path).toBe(`/replication/replicate`);
        return Promise.resolve();
      },
    };
    clusterMaker(mockConnection).replications.deleteAll().then(assert(undefined));
  });

  it('should query replication operations with various filters', () => {
    const opts = {
      collection: 'Collection',
      shard: 'shard',
      targetNode: 'node1',
      includeHistory: true,
    };
    const mockResult = [{ id: 'replication-id' }];
    const mockConnection = {
      get: (path: string) => {
        expect(path).toBe(
          `/replication/replicate?collection=Collection&shard=shard&targetNode=node1&includeHistory=true`
        );
        return Promise.resolve(mockResult);
      },
    };
    clusterMaker(mockConnection).replications.query(opts).then(assert(mockResult));
  });
});
