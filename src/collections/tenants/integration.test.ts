/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
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
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    return client.collections
      .create({
        name: collectionName,
        multiTenancy: weaviate.configure.multiTenancy({ enabled: true }),
      })
      .then(() =>
        collection.tenants.create([
          { name: 'hot', activityStatus: 'HOT' },
          { name: 'cold', activityStatus: 'COLD' },
          { name: 'cold-new', activityStatus: 'COLD' },
          { name: 'remove-me', activityStatus: 'HOT' },
        ])
      );
  });

  it('should be able to create a tenant with old nomenclature', async () => {
    const tenant = 'tenant';
    const result = await collection.tenants.create([{ name: tenant, activityStatus: 'HOT' }]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe(tenant);
    expect(result[0].activityStatus).toBe('ACTIVE');
  });

  it('should be able to create a tenant with new nomenclature', async () => {
    const tenant = 'tenant';
    const result = await collection.tenants.create([{ name: tenant, activityStatus: 'ACTIVE' }]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe(tenant);
    expect(result[0].activityStatus).toBe('ACTIVE');
  });

  it('should be able to get existing tenants', async () => {
    const result = await collection.tenants.get();

    expect(result).toHaveProperty('hot');
    expect(result.hot.name).toBe('hot');
    expect(result.hot.activityStatus).toBe('ACTIVE');

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

  it('should be able to update a tenant with old nomenclature', async () => {
    const result = await collection.tenants.update([{ name: 'cold', activityStatus: 'HOT' }]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('cold');
    expect(result[0].activityStatus).toBe('ACTIVE');
  });

  it('should be able to update a tenant with new nomenclature', async () => {
    const result = await collection.tenants.update([{ name: 'cold-new', activityStatus: 'ACTIVE' }]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('cold-new');
    expect(result[0].activityStatus).toBe('ACTIVE');
  });

  describe('getByName and getByNames', () => {
    it('should be able to get a tenant by name string', async () => {
      const result = await collection.tenants.getByName('hot');
      expect(result).toHaveProperty('name', 'hot');
      expect(result).toHaveProperty('activityStatus', 'ACTIVE');
    });

    it('should be able to get a tenant by tenant object', async () => {
      const result = await collection.tenants.getByName({ name: 'hot' });
      expect(result).toHaveProperty('name', 'hot');
      expect(result).toHaveProperty('activityStatus', 'ACTIVE');
    });

    it('should fail to get a non-existing tenant', async () => {
      const result = await collection.tenants.getByName('non-existing');
      expect(result).toBeNull();
    });

    it('should be able to get tenants by name strings', async () => {
      const query = () => collection.tenants.getByNames(['hot', 'cold']);
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
        await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
        return;
      }
      const result = await query();
      expect(result).toHaveProperty('hot');
      expect(result).toHaveProperty('cold');
    });

    it('should be able to get tenants by tenant objects', async () => {
      const query = () => collection.tenants.getByNames([{ name: 'hot' }, { name: 'cold' }]);
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
        await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
        return;
      }
      const result = await query();
      expect(result).toHaveProperty('hot');
      expect(result).toHaveProperty('cold');
    });

    it('should be able to get tenants by mixed name strings and tenant objects', async () => {
      const query = () => collection.tenants.getByNames(['hot', { name: 'cold' }]);
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
        await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
        return;
      }
      const result = await query();
      expect(result).toHaveProperty('hot');
      expect(result).toHaveProperty('cold');
    });

    it('should be able to get partial tenants', async () => {
      const query = () => collection.tenants.getByNames(['hot', 'non-existing']);
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
        await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
        return;
      }
      const result = await query();
      expect(result).toHaveProperty('hot');
      expect(result).not.toHaveProperty('cold');
      expect(result).not.toHaveProperty('non-existing');
    });
  });

  it('should be able to create and update 1000 tenants', async () => {
    const howManyToAdd = 1000;
    const howManyPreExisting = Object.entries(await collection.tenants.get()).length;
    const howMany = howManyToAdd + howManyPreExisting;
    const tenants = Array.from({ length: howManyToAdd }, (_, i) => ({
      name: `tenant-${i}`,
    }));
    await collection.tenants.create(tenants);
    const getTenants = await collection.tenants.get();
    expect(Object.entries(getTenants).length).toBe(howMany);
    expect(Object.values(getTenants).every((tenant) => tenant.activityStatus === 'ACTIVE')).toBe(true);
    const updated = await collection.tenants.update(
      Object.values(getTenants).map((tenant) => ({ name: tenant.name, activityStatus: 'INACTIVE' }))
    );
    expect(Object.entries(updated).length).toBe(howMany);
    expect(Object.values(updated).every((tenant) => tenant.activityStatus === 'INACTIVE')).toBe(true);
  });
});
