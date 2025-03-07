import weaviate, { ApiKey, Permission, Role, WeaviateClient } from '..';
import { WeaviateStartUpError, WeaviateUnexpectedStatusCodeError } from '../errors';
import { DbVersion } from '../utils/dbVersion';

const only = DbVersion.fromString(`v${process.env.WEAVIATE_VERSION!}`).isAtLeast(1, 29, 0)
  ? describe
  : describe.skip;

only('Integration testing of the roles namespace', () => {
  let client: WeaviateClient;

  beforeAll(async () => {
    client = await weaviate.connectToLocal({
      port: 8091,
      grpcPort: 50062,
      authCredentials: new ApiKey('admin-key'),
    });
  });

  it('should be able to retrieve the default roles', async () => {
    const roles = await client.roles.listAll();
    expect(Object.values(roles).length).toBeGreaterThan(0);
  });

  it('should fail to start up if no key provided', () =>
    expect(
      weaviate.connectToLocal({
        port: 8091,
        grpcPort: 50062,
      })
    ).rejects.toThrowError(WeaviateStartUpError));

  it('should check the existance of a real role', async () => {
    const exists = await client.roles.exists('admin');
    expect(exists).toBeTruthy();
  });

  it('should check the existance of a fake role', async () => {
    const exists = await client.roles.exists('fake-role');
    expect(exists).toBeFalsy();
  });

  describe('should be able to create roles using the permissions factory', () => {
    type TestCase = {
      roleName: string;
      permissions: Permission[];
      expected: Role;
    };
    const testCases: TestCase[] = [
      {
        roleName: 'backups',
        permissions: weaviate.permissions.backup({ collection: 'Some-collection', manage: true }),
        expected: {
          name: 'backups',
          backupsPermissions: [{ collection: 'Some-collection', actions: ['manage_backups'] }],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
          tenantsPermissions: [],
          usersPermissions: [],
        },
      },
      {
        roleName: 'cluster',
        permissions: weaviate.permissions.cluster({ read: true }),
        expected: {
          name: 'cluster',
          backupsPermissions: [],
          clusterPermissions: [{ actions: ['read_cluster'] }],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
          tenantsPermissions: [],
          usersPermissions: [],
        },
      },
      {
        roleName: 'collections',
        permissions: weaviate.permissions.collections({
          collection: 'Some-collection',
          create_collection: true,
          read_config: true,
          update_config: true,
          delete_collection: true,
        }),
        expected: {
          name: 'collections',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [
            {
              collection: 'Some-collection',
              actions: ['create_collections', 'read_collections', 'update_collections', 'delete_collections'],
            },
          ],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
          tenantsPermissions: [],
          usersPermissions: [],
        },
      },
      {
        roleName: 'data',
        permissions: weaviate.permissions.data({
          collection: 'Some-collection',
          create: true,
          read: true,
          update: true,
          delete: true,
        }),
        expected: {
          name: 'data',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [
            {
              collection: 'Some-collection',
              actions: ['create_data', 'read_data', 'update_data', 'delete_data'],
            },
          ],
          nodesPermissions: [],
          rolesPermissions: [],
          tenantsPermissions: [],
          usersPermissions: [],
        },
      },
      {
        roleName: 'nodes-verbose',
        permissions: weaviate.permissions.nodes.verbose({
          collection: 'Some-collection',
          read: true,
        }),
        expected: {
          name: 'nodes-verbose',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [
            { collection: 'Some-collection', verbosity: 'verbose', actions: ['read_nodes'] },
          ],
          rolesPermissions: [],
          tenantsPermissions: [],
          usersPermissions: [],
        },
      },
      {
        roleName: 'nodes-minimal',
        permissions: weaviate.permissions.nodes.minimal({
          read: true,
        }),
        expected: {
          name: 'nodes-minimal',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [{ collection: '*', verbosity: 'minimal', actions: ['read_nodes'] }],
          rolesPermissions: [],
          tenantsPermissions: [],
          usersPermissions: [],
        },
      },
      {
        roleName: 'roles',
        permissions: weaviate.permissions.roles({
          role: 'some-role',
          create: true,
          read: true,
          update: true,
          delete: true,
        }),
        expected: {
          name: 'roles',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [
            { role: 'some-role', actions: ['create_roles', 'read_roles', 'update_roles', 'delete_roles'] },
          ],
          tenantsPermissions: [],
          usersPermissions: [],
        },
      },
      {
        roleName: 'tenants',
        permissions: weaviate.permissions.tenants({
          collection: 'some-collection',
          create: true,
          read: true,
          update: true,
          delete: true,
        }),
        expected: {
          name: 'tenants',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
          tenantsPermissions: [
            {
              collection: 'Some-collection',
              actions: ['create_tenants', 'read_tenants', 'update_tenants', 'delete_tenants'],
            },
          ],
          usersPermissions: [],
        },
      },
      {
        roleName: 'users',
        permissions: weaviate.permissions.users({
          user: 'some-user',
          assign_and_revoke: true,
          read: true,
        }),
        expected: {
          name: 'users',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
          tenantsPermissions: [],
          usersPermissions: [{ users: 'some-user', actions: ['assign_and_revoke_users', 'read_users'] }],
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(`with ${testCase.roleName} permissions`, async () => {
        await client.roles.create(testCase.roleName, testCase.permissions);
        const role = await client.roles.byName(testCase.roleName);
        expect(role).toEqual(testCase.expected);
      });
    });
  });

  it('should delete one of the created roles', async () => {
    await client.roles.delete('backups');
    await expect(client.roles.byName('backups')).rejects.toThrowError(WeaviateUnexpectedStatusCodeError);
    await expect(client.roles.exists('backups')).resolves.toBeFalsy();
  });

  afterAll(() =>
    Promise.all(
      [
        'backups',
        'cluster',
        'collections',
        'data',
        'nodes-verbose',
        'nodes-minimal',
        'roles',
        'tenants',
        'users',
      ].map((n) => client.roles.delete(n))
    )
  );
});
