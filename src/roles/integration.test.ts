import weaviate, { ApiKey, Permission, Role, WeaviateClient } from '..';
import {
  WeaviateInsufficientPermissionsError,
  WeaviateStartUpError,
  WeaviateUnexpectedStatusCodeError,
} from '../errors';
import { DbVersion } from '../utils/dbVersion';

const only = DbVersion.fromString(`v${process.env.WEAVIATE_VERSION!}`).isAtLeast(1, 28, 0)
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

  it('should fail with insufficient permissions if permission-less key provided', async () => {
    const unauthenticatedClient = await weaviate.connectToLocal({
      port: 8091,
      grpcPort: 50062,
      authCredentials: new ApiKey('custom-key'),
    });
    await expect(unauthenticatedClient.roles.listAll()).rejects.toThrowError(
      WeaviateInsufficientPermissionsError
    );
  });

  it('should get roles by user', async () => {
    const roles = await client.roles.byUser('admin-user');
    expect(Object.keys(roles).length).toBeGreaterThan(0);
  });

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
          backupsPermissions: [{ collection: 'Some-collection', action: 'manage_backups' }],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
        },
      },
      {
        roleName: 'cluster',
        permissions: weaviate.permissions.cluster({ read: true }),
        expected: {
          name: 'cluster',
          backupsPermissions: [],
          clusterPermissions: [{ action: 'read_cluster' }],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
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
            { collection: 'Some-collection', action: 'create_collections' },
            { collection: 'Some-collection', action: 'read_collections' },
            { collection: 'Some-collection', action: 'update_collections' },
            { collection: 'Some-collection', action: 'delete_collections' },
          ],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [],
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
            { collection: 'Some-collection', action: 'create_data' },
            { collection: 'Some-collection', action: 'read_data' },
            { collection: 'Some-collection', action: 'update_data' },
            { collection: 'Some-collection', action: 'delete_data' },
          ],
          nodesPermissions: [],
          rolesPermissions: [],
        },
      },
      {
        roleName: 'nodes',
        permissions: weaviate.permissions.nodes({
          collection: 'Some-collection',
          verbosity: 'verbose',
          read: true,
        }),
        expected: {
          name: 'nodes',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [{ collection: 'Some-collection', verbosity: 'verbose', action: 'read_nodes' }],
          rolesPermissions: [],
        },
      },
      {
        roleName: 'roles',
        permissions: weaviate.permissions.roles({ role: 'some-role', manage: true }),
        expected: {
          name: 'roles',
          backupsPermissions: [],
          clusterPermissions: [],
          collectionsPermissions: [],
          dataPermissions: [],
          nodesPermissions: [],
          rolesPermissions: [{ role: 'some-role', action: 'manage_roles' }],
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
});
