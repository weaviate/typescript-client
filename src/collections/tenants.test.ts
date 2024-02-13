/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';
import Configure from './configure';

describe('Testing of the collection.data methods', () => {
  const client = weaviate.next({
    http: {
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

  const className = 'TestCollectionTenants';
  const collection = client.collections.get(className);

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(() => {
    return client.collections
      .create({
        name: className,
        multiTenancy: Configure.multiTenancy({ enabled: true }),
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
});
