import weaviate, { ApiKey } from '..';
import { DbVersion } from '../utils/dbVersion';

const only = DbVersion.fromString(`v${process.env.WEAVIATE_VERSION!}`).isAtLeast(1, 29, 0)
  ? describe
  : describe.skip;

only('Integration testing of the users namespace', () => {
  const makeClient = (key: string) =>
    weaviate.connectToLocal({
      port: 8091,
      grpcPort: 50062,
      authCredentials: new ApiKey(key),
    });

  beforeAll(() =>
    makeClient('admin-key').then((c) =>
      c.roles.create('test', weaviate.permissions.data({ collection: 'Thing', read: true }))
    )
  );

  it('should be able to retrieve own admin user with root roles', async () => {
    const user = await makeClient('admin-key').then((client) => client.users.getMyUser());
    expect(user.id).toBe('admin-user'); // defined in the compose file in the ci/ dir
    expect(user.roles).toBeDefined();
  });

  it('should be able to retrieve own custom user with no roles', async () => {
    const user = await makeClient('custom-key').then((client) => client.users.getMyUser());
    expect(user.id).toBe('custom-user'); // defined in the compose file in the ci/ dir
    expect(user.roles).toBeUndefined();
  });

  it('should be able to retrieve the assigned roles of a user', async () => {
    const roles = await makeClient('admin-key').then((client) => client.users.getAssignedRoles('admin-user'));
    expect(roles.root).toBeDefined();
    expect(roles.root.backupsPermissions.length).toBeGreaterThan(0);
    expect(roles.root.clusterPermissions.length).toBeGreaterThan(0);
    expect(roles.root.collectionsPermissions.length).toBeGreaterThan(0);
    expect(roles.root.dataPermissions.length).toBeGreaterThan(0);
    expect(roles.root.nodesPermissions.length).toBeGreaterThan(0);
    expect(roles.root.rolesPermissions.length).toBeGreaterThan(0);
  });

  it('should be able to assign a role to a user', async () => {
    const adminClient = await makeClient('admin-key');
    await adminClient.users.assignRoles('test', 'custom-user');

    const roles = await adminClient.users.getAssignedRoles('custom-user');
    expect(roles.test).toBeDefined();
    expect(roles.test.dataPermissions.length).toEqual(1);
  });

  it('should be able to revoke a role from a user', async () => {
    const adminClient = await makeClient('admin-key');
    await adminClient.users.revokeRoles('test', 'custom-user');

    const roles = await adminClient.users.getAssignedRoles('custom-user');
    expect(roles.test).toBeUndefined();
  });

  afterAll(() => makeClient('admin-key').then((c) => c.roles.delete('test')));
});
