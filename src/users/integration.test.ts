import { afterAll, beforeAll, expect, it } from 'vitest';
import weaviate, { ApiKey, WeaviateClient } from '..';
import { requireAtLeast } from '../../test/version.js';
import { WeaviateUserTypeDB } from '../openapi/types.js';
import { GetUserOptions, UserDB } from './types.js';

requireAtLeast(1, 29, 0).describe('Integration testing of the users namespace', () => {
  const makeClient = (key: string) =>
    weaviate.connectToLocal({
      port: 8091,
      grpcPort: 50062,
      authCredentials: new ApiKey(key),
    });

  beforeAll(() =>
    makeClient('admin-key').then((c) => {
      c.roles.delete('test');
      c.roles.create('test', weaviate.permissions.data({ collection: 'Thing', read: true }));
    })
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

  requireAtLeast(1, 30, 0).describe('dynamic user management', () => {
    /** List dynamic DB users. */
    const listDBUsers = (c: WeaviateClient, opts?: GetUserOptions) =>
      c.users.db.listAll(opts).then((all) => all.filter((u) => u.userType == 'db_user'));

    const deleteAllUsers = async (c: WeaviateClient) => {
      const users = await listDBUsers(c);
      await Promise.all(users.map((user) => c.users.db.delete(user.id)));
    };

    beforeAll(() => makeClient('admin-key').then(deleteAllUsers));

    it('should be able to manage "db" user lifecycle', async () => {
      const admin = await makeClient('admin-key');

      /** Pass false to expect a rejected promise, chain assertions about dynamic-dave otherwise. */
      const expectDave = (ok: boolean = true) => {
        const promise = expect(admin.users.db.byName('dynamic-dave'));
        return ok ? promise.resolves : promise.rejects;
      };

      await admin.users.db.create('dynamic-dave');
      await expectDave().toHaveProperty('active', true);

      // Second activation is a no-op
      await expect(admin.users.db.activate('dynamic-dave')).resolves.toEqual(false);

      await expect(admin.users.db.deactivate('dynamic-dave')).resolves.toEqual(true);
      await expectDave().toHaveProperty('active', false);

      // Second deactivation is a no-op
      await expect(admin.users.db.deactivate('dynamic-dave', { revokeKey: true })).resolves.toEqual(false);

      // Re-activate
      await expect(admin.users.db.activate('dynamic-dave')).resolves.toEqual(true);

      await expect(admin.users.db.delete('dynamic-dave')).resolves.toEqual(true);
      await expectDave(false).toHaveProperty('code', 404);

      // Second deletion is a no-op
      await expect(admin.users.db.delete('dynamic-dave')).resolves.toEqual(false);
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

      await Promise.all(['jim', 'pam', 'dwight'].map((user) => admin.users.db.create(user)));

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

      await admin.users[kind].assignRoles('test', 'role-rick');
      await expect(admin.users[kind].getAssignedRoles('role-rick')).resolves.toEqual(
        expect.objectContaining({ test: expect.any(Object) })
      );

      await admin.users[kind].revokeRoles('test', 'role-rick');
      await expect(admin.users[kind].getAssignedRoles('role-rick')).resolves.toEqual({});
    });

    it('should be able to fetch assigned roles with all permissions', async () => {
      const admin = await makeClient('admin-key');

      await admin.roles.delete('Permissioner');
      await admin.roles.create('Permissioner', [
        { collection: 'Things', actions: ['manage_backups'] },
        { collection: 'Things', tenant: 'data-tenant', actions: ['create_data'] },
        { collection: 'Things', verbosity: 'minimal', actions: ['read_nodes'] },
      ]);
      await admin.users.db.create('permission-peter');
      await admin.users.db.assignRoles('Permissioner', 'permission-peter');

      const roles = await admin.users.db.getAssignedRoles('permission-peter', { includePermissions: true });
      expect(roles.Permissioner.backupsPermissions).toHaveLength(1);
      expect(roles.Permissioner.dataPermissions).toHaveLength(1);
      expect(roles.Permissioner.nodesPermissions).toHaveLength(1);
    });

    requireAtLeast(1, 30, 1).describe('additional DUM features', () => {
      it('should be able to fetch additional user info', async () => {
        const admin = await makeClient('admin-key');
        const timKey = await admin.users.db.create('timely-tim');

        // Allow timely-tim to read own role
        await admin.roles.delete('TimReader');
        await admin.roles.create('TimReader', [{ actions: ['read_users'], users: 'timely-tim' }]);
        await admin.users.db.assignRoles('TimReader', 'timely-tim');

        // Get user info with / without lastUserTime
        const timUser = await admin.users.db.byName('timely-tim');
        expect(timUser.createdAt).not.toBeUndefined(); // always returned
        expect(timUser.lastUsedAt).toBeUndefined();
        expect(timUser.apiKeyFirstLetters).not.toBeUndefined();

        // Check that Tim cannnot see the first letters of the API key
        const tim = await makeClient(timKey);
        await expect(tim.users.db.byName('timely-tim')).resolves.toHaveProperty(
          'apiKeyFirstLetters',
          undefined
        );

        await expect(admin.users.db.byName('timely-tim', { includeLastUsedTime: true })).resolves.toEqual(
          expect.objectContaining({ lastUsedAt: expect.any(Date) })
        );

        // apiKeyFirstLetters contain first letters of the API key
        expect(timKey).toMatch(new RegExp(`^${timUser.apiKeyFirstLetters}.*`));
      });

      it('should be able to list all users with additional info', async () => {
        const admin = await makeClient('admin-key');

        // Create test users and use each at least once
        const created = await Promise.all(
          ['A', 'B', 'C'].map(async (user) => {
            const key = await admin.users.db.create(user);
            await makeClient(key).then((c) => c.users.getMyUser());
            return user;
          })
        );

        const users = await listDBUsers(admin, { includeLastUsedTime: true }).then((users) =>
          users.filter((user) => created.includes(user.id))
        );

        users.forEach((user) =>
          expect(user).toEqual(
            expect.objectContaining({
              createdAt: expect.any(Date),
              lastUsedAt: expect.any(Date),
              apiKeyFirstLetters: expect.any(String),
            })
          )
        );
      });
    });

    afterAll(() => makeClient('admin-key').then(deleteAllUsers));
  });

  afterAll(() => makeClient('admin-key').then((c) => c.roles.delete('test')));
});
