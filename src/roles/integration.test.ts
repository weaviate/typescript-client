import weaviate, {
  ApiKey,
  CollectionsAction,
  DataAction,
  Permission,
  Role,
  RolesAction,
  TenantsAction,
  WeaviateClient,
  UserAssignment,
} from '..';
import { requireAtLeast } from '../../test/version';
import { WeaviateStartUpError, WeaviateUnexpectedStatusCodeError } from '../errors';

type TestCase = {
  roleName: string;
  permissions: Permission[];
  expected: Role;
};

const emptyPermissions = {
  backupsPermissions: [],
  clusterPermissions: [],
  collectionsPermissions: [],
  dataPermissions: [],
  nodesPermissions: [],
  rolesPermissions: [],
  tenantsPermissions: [],
  usersPermissions: [],
};
const crud = {
  create: true,
  read: true,
  update: true,
  delete: true,
};
const collectionsActions: CollectionsAction[] = [
  'create_collections',
  'read_collections',
  'update_collections',
  'delete_collections',
];
const dataActions: DataAction[] = ['create_data', 'read_data', 'update_data', 'delete_data'];
const tenantsActions: TenantsAction[] = [
  'create_tenants',
  'read_tenants',
  'update_tenants',
  'delete_tenants',
];
const rolesActions: RolesAction[] = ['create_roles', 'read_roles', 'update_roles', 'delete_roles'];
const testCases: TestCase[] = [
  {
    roleName: 'backups',
    permissions: weaviate.permissions.backup({ collection: 'Some-collection', manage: true }),
    expected: {
      name: 'backups',
      ...emptyPermissions,
      backupsPermissions: [{ collection: 'Some-collection', actions: ['manage_backups'] }],
    },
  },
  {
    roleName: 'cluster',
    permissions: weaviate.permissions.cluster({ read: true }),
    expected: {
      name: 'cluster',
      ...emptyPermissions,
      clusterPermissions: [{ actions: ['read_cluster'] }],
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
      ...emptyPermissions,
      collectionsPermissions: [
        {
          collection: 'Some-collection',
          actions: collectionsActions,
        },
      ],
    },
  },
  {
    roleName: 'data-st',
    permissions: weaviate.permissions.data({
      collection: 'Some-collection',
      ...crud,
    }),
    expected: {
      name: 'data-st',
      ...emptyPermissions,
      dataPermissions: [
        {
          collection: 'Some-collection',
          tenant: '*',
          actions: dataActions,
        },
      ],
    },
  },
  {
    roleName: 'data-mt',
    permissions: weaviate.permissions.data({
      collection: 'Some-collection',
      tenant: 'some-tenant',
      ...crud,
    }),
    expected: {
      name: 'data-mt',
      ...emptyPermissions,
      dataPermissions: [
        {
          collection: 'Some-collection',
          tenant: 'some-tenant',
          actions: dataActions,
        },
      ],
    },
  },
  {
    roleName: 'data-mt-mixed',
    permissions: weaviate.permissions.data({
      collection: ['Some-collection', 'Another-collection'],
      tenant: ['some-tenant', 'another-tenant'],
      ...crud,
    }),
    expected: {
      name: 'data-mt-mixed',
      ...emptyPermissions,
      dataPermissions: [
        {
          collection: 'Some-collection',
          tenant: 'some-tenant',
          actions: dataActions,
        },
        {
          collection: 'Some-collection',
          tenant: 'another-tenant',
          actions: dataActions,
        },
        {
          collection: 'Another-collection',
          tenant: 'some-tenant',
          actions: dataActions,
        },
        {
          collection: 'Another-collection',
          tenant: 'another-tenant',
          actions: dataActions,
        },
      ],
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
      ...emptyPermissions,
      nodesPermissions: [{ collection: 'Some-collection', verbosity: 'verbose', actions: ['read_nodes'] }],
    },
  },
  {
    roleName: 'nodes-minimal',
    permissions: weaviate.permissions.nodes.minimal({
      read: true,
    }),
    expected: {
      name: 'nodes-minimal',
      ...emptyPermissions,
      nodesPermissions: [{ collection: '*', verbosity: 'minimal', actions: ['read_nodes'] }],
    },
  },
  {
    roleName: 'roles',
    permissions: weaviate.permissions.roles({
      role: 'some-role',
      ...crud,
    }),
    expected: {
      name: 'roles',
      ...emptyPermissions,
      rolesPermissions: [{ role: 'some-role', actions: rolesActions }],
    },
  },
  {
    roleName: 'tenants-st',
    permissions: weaviate.permissions.tenants({
      collection: 'some-collection',
      ...crud,
    }),
    expected: {
      name: 'tenants-st',
      ...emptyPermissions,
      tenantsPermissions: [
        {
          collection: 'Some-collection',
          tenant: '*',
          actions: tenantsActions,
        },
      ],
    },
  },
  {
    roleName: 'tenants-mt',
    permissions: weaviate.permissions.tenants({
      collection: 'some-collection',
      tenant: 'some-tenant',
      ...crud,
    }),
    expected: {
      name: 'tenants-mt',
      ...emptyPermissions,
      tenantsPermissions: [
        {
          collection: 'Some-collection',
          tenant: 'some-tenant',
          actions: tenantsActions,
        },
      ],
    },
  },
  {
    roleName: 'tenants-mt-mixed',
    permissions: weaviate.permissions.tenants({
      collection: ['some-collection', 'another-collection'],
      tenant: ['some-tenant', 'another-tenant'],
      ...crud,
    }),
    expected: {
      name: 'tenants-mt-mixed',
      ...emptyPermissions,
      tenantsPermissions: [
        {
          collection: 'Some-collection',
          tenant: 'some-tenant',
          actions: tenantsActions,
        },
        {
          collection: 'Some-collection',
          tenant: 'another-tenant',
          actions: tenantsActions,
        },
        {
          collection: 'Another-collection',
          tenant: 'some-tenant',
          actions: tenantsActions,
        },
        {
          collection: 'Another-collection',
          tenant: 'another-tenant',
          actions: tenantsActions,
        },
      ],
    },
  },
  {
    roleName: 'users',
    permissions: weaviate.permissions.users({
      user: 'some-user',
      assignAndRevoke: true,
      read: true,
    }),
    expected: {
      name: 'users',
      ...emptyPermissions,
      usersPermissions: [{ users: 'some-user', actions: ['assign_and_revoke_users', 'read_users'] }],
    },
  },
];

requireAtLeast(
  1,
  29,
  0
)('Integration testing of the roles namespace', () => {
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

  requireAtLeast(
    1,
    30,
    0
  )('namespaced users', () => {
    it('retrieves assigned users with namespace', async () => {
      await client.roles.create('landlord', {
        collection: 'Buildings',
        tenant: 'john doe',
        actions: ['create_tenants', 'delete_tenants'],
      });

      await client.users.db.create('Innkeeper').catch((res) => expect(res.code).toEqual(409));

      await client.users.db.assignRoles('landlord', 'custom-user');
      await client.users.db.assignRoles('landlord', 'Innkeeper');

      const assignments = await client.roles.userAssignments('landlord');

      expect(assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining<UserAssignment>({ id: 'custom-user', userType: 'db_env_user' }),
          expect.objectContaining<UserAssignment>({ id: 'Innkeeper', userType: 'db_user' }),
        ])
      );

      await client.users.db.delete('Innkeeper');
      await client.roles.delete('landlord');
    });
  });

  describe('should be able to create roles using the permissions factory', () => {
    testCases.forEach((testCase) => {
      it(`with ${testCase.roleName} permissions`, async () => {
        await client.roles.create(testCase.roleName, testCase.permissions);
        const role = await client.roles.byName(testCase.roleName);
        expect(role).toEqual(testCase.expected);
      });
    });
  });

  it('should be able to add permissions to one of the created roles', async () => {
    await client.roles.addPermissions(
      'backups',
      weaviate.permissions.backup({ collection: 'Another-collection', manage: true })
    );
    const role = await client.roles.byName('backups');
    expect(role).toEqual({
      name: 'backups',
      ...emptyPermissions,
      backupsPermissions: [
        { collection: 'Some-collection', actions: ['manage_backups'] },
        { collection: 'Another-collection', actions: ['manage_backups'] },
      ],
    });
  });

  it('should be able to remove permissions from one of the created roles', async () => {
    await client.roles.removePermissions(
      'backups',
      weaviate.permissions.backup({ collection: 'Another-collection', manage: true })
    );
    const role = await client.roles.byName('backups');
    expect(role).toEqual({
      name: 'backups',
      ...emptyPermissions,
      backupsPermissions: [{ collection: 'Some-collection', actions: ['manage_backups'] }],
    });
  });

  it('should delete one of the created roles', async () => {
    await client.roles.delete('backups');
    await expect(client.roles.byName('backups')).rejects.toThrowError(WeaviateUnexpectedStatusCodeError);
    await expect(client.roles.exists('backups')).resolves.toBeFalsy();
  });

  afterAll(() => Promise.all(testCases.map((t) => client.roles.delete(t.roleName))));
});
