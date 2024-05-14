/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate, { WeaviateClient } from '../../index.js';
import { Collection } from '../collection/index.js';

describe('Testing of the collection.tenants methods', () => {
  let client: WeaviateClient;
  let collection: Collection<any, 'TestCollectionTenants'>;
  const collectionName = 'TestCollectionTenants';

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.client({
      rest: {
        secure: false,
        host: 'localhost',
        port: 8080,
      },
      grpc: {
        secure: false,
        host: 'localhost',
        port: 50051,
      },
    });
    collection = client.collections.get(collectionName);
    return client.collections
      .create({
        name: collectionName,
        multiTenancy: weaviate.configure.multiTenancy({ enabled: true }),
      })
      .then(() =>
        collection.tenants.create([
          { name: 'hot', activityStatus: 'HOT' },
          { name: 'cold', activityStatus: 'COLD' },
          { name: 'remove-me', activityStatus: 'HOT' },
        ])
      );
  });

  it('should be able to create a tenant', async () => {
    const tenant = 'tenant';
    const result = await collection.tenants.create([{ name: tenant, activityStatus: 'HOT' }]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe(tenant);
    expect(result[0].activityStatus).toBe('HOT');
  });

  it('should be able to get existing tenants', async () => {
    const result = await collection.tenants.get();

    expect(result).toHaveProperty('hot');
    expect(result.hot.name).toBe('hot');
    expect(result.hot.activityStatus).toBe('HOT');

    expect(result).toHaveProperty('cold');
    expect(result.cold.name).toBe('cold');
    // expect(result.tenant.activityStatus).toBe('COLD'); // updated below
  });

  it('should be able to remove a tenant', async () => {
    const result = await collection.tenants
      .remove([{ name: 'remove-me' }])
      .then(() => collection.tenants.get());
    expect(result).not.toHaveProperty('remove-me');
  });

  it('should be able to update a tenant', async () => {
    const result = await collection.tenants.update([{ name: 'cold', activityStatus: 'HOT' }]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('cold');
    expect(result[0].activityStatus).toBe('HOT');
  });

  describe('testing of the getByName and getByNames methods', () => {
    it('should be able to get a tenant by name string', async () => {
      const result = await collection.tenants.getByName('hot');
      expect(result).toHaveProperty('name', 'hot');
      expect(result).toHaveProperty('activityStatus', 'HOT');
    });

    it('should be able to get a tenant by tenant object', async () => {
      const result = await collection.tenants.getByName({ name: 'hot' });
      expect(result).toHaveProperty('name', 'hot');
      expect(result).toHaveProperty('activityStatus', 'HOT');
    });

    it('should fail to get a non-existing tenant', async () => {
      const result = await collection.tenants.getByName('non-existing');
      expect(result).toBeNull();
    });

    it('should be able to get tenants by name strings', async () => {
      const result = await collection.tenants.getByNames(['hot', 'cold']);
      expect(result).toHaveProperty('hot');
      expect(result).toHaveProperty('cold');
    });

    it('should be able to get tenants by tenant objects', async () => {
      const result = await collection.tenants.getByNames([{ name: 'hot' }, { name: 'cold' }]);
      expect(result).toHaveProperty('hot');
      expect(result).toHaveProperty('cold');
    });

    it('should be able to get tenants by mixed name strings and tenant objects', async () => {
      const result = await collection.tenants.getByNames(['hot', { name: 'cold' }]);
      expect(result).toHaveProperty('hot');
      expect(result).toHaveProperty('cold');
    });

    it('should be able to get partial tenants', async () => {
      const result = await collection.tenants.getByNames(['hot', 'non-existing']);
      expect(result).toHaveProperty('hot');
      expect(result).not.toHaveProperty('cold');
      expect(result).not.toHaveProperty('non-existing');
    });
  });
});
