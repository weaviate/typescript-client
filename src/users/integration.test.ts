import weaviate, { ApiKey } from '..';
import { DbVersion } from '../utils/dbVersion';
import { WeaviateUserTypeDB } from '../v2';
import { UserDB } from './types.js';

const version = DbVersion.fromString(`v${process.env.WEAVIATE_VERSION!}`);

/** Run the suite / test only for Weaviate version above this. */
const requireAtLeast = (...semver: [...Parameters<DbVersion['isAtLeast']>]) =>
  version.isAtLeast(...semver) ? describe : describe.skip;

requireAtLeast(
  1,
  29,
  0
)('Integration testing of the users namespace', () => {
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

  requireAtLeast(
    1,
    30,
    0
  )('dynamic user management', () => {
    it('should be able to manage "db" user lifecycle', async () => {
      const client = await makeClient('admin-key');

      /** Pass false to expect a rejected promise, chain assertions about dynamic-dave otherwise. */
      const expectDave = (ok: boolean = true) => {
        const promise = expect(client.users.db.byName('dynamic-dave'));
        return ok ? promise.resolves : promise.rejects;
      };

      await client.users.db.create('dynamic-dave');
      expectDave().toHaveProperty('active', true);

      // Second activation is a no-op
      expect(client.users.db.activate('dynamic-dave')).resolves.toEqual(true);

      await client.users.db.deactivate('dynamic-dave');
      expectDave().toHaveProperty('active', false);

      // Second deactivation is a no-op
      expect(client.users.db.deactivate('dynamic-dave')).resolves.toEqual(true);

      await client.users.db.delete('dynamic-dave');
      expectDave(false).toHaveProperty('code', 404);
    });

    it('should be able to obtain and rotate api keys', async () => {
      const admin = await makeClient('admin-key');
      const apiKey = await admin.users.db.create('api-ashley');

      let userAshley = await makeClient(apiKey).then((client) => client.users.getMyUser());
      expect(userAshley.id).toEqual('api-ashley');

      const newKey = await admin.users.db.rotateKey('api-ashley');
      userAshley = await makeClient(newKey).then((client) => client.users.getMyUser());
      expect(userAshley.id).toEqual('api-ashley');
    });

    it('should be able to list all dynamic users', async () => {
      const admin = await makeClient('admin-key');

      const created: Promise<any>[] = [];
      for (const user of ['jim', 'pam', 'dwight']) {
        created.push(admin.users.db.create(user));
      }
      await Promise.all(created);

      const all = await admin.users.db.listAll();
      expect(all.length).toBeGreaterThanOrEqual(3);

      const pam = await admin.users.db.byName('pam');
      expect(all).toEqual(expect.arrayContaining<UserDB>([pam]));
    });

    it('should be able to fetch static users', async () => {
      const custom = await makeClient('admin-key').then((client) => client.users.db.byName('custom-user'));
      expect(custom.userType).toEqual<WeaviateUserTypeDB>('db_env_user');
    });

    it.each<'db' | 'oidc'>(['db', 'oidc'])('should be able to assign roles to "%s" users', async (kind) => {
      const admin = await makeClient('admin-key');

      if (kind === 'db') {
        await admin.users.db.create('role-rick');
      }

      await admin.users.db.assignRoles('test', 'role-rick');
      expect(admin.users.db.getAssignedRoles('role-rick')).resolves.toEqual(
        expect.objectContaining({ test: expect.any(Object) })
      );

      await admin.users.db.revokeRoles('test', 'role-rick');
      expect(admin.users.db.getAssignedRoles('role-rick')).resolves.toEqual({});
    });

    afterAll(() =>
      makeClient('admin-key').then((c) => {
        for (const user of ['jim', 'pam', 'dwight', 'dynamic-dave', 'api-ashley', 'role-rick']) {
          c.users.db.delete(user);
        }
      })
    );
  });

  afterAll(() => makeClient('admin-key').then((c) => c.roles.delete('test')));
});
