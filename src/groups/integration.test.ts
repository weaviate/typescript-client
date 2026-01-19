import { expect, it } from 'vitest';
import weaviate, { ApiKey, GroupAssignment } from '..';
import { requireAtLeast } from '../../test/version.js';

requireAtLeast(1, 32, 5).describe('Integration testing of the OIDC groups', () => {
  const makeClient = (key: string = 'admin-key') =>
    weaviate.connectToLocal({
      port: 8091,
      grpcPort: 50062,
      authCredentials: new ApiKey(key),
    });

  it('should assign / get / revoke group roles', async () => {
    const client = await makeClient();
    const groupID = './assign-group';
    const roles = ['viewer', 'admin'];

    await client.groups.oidc.revokeRoles(groupID, roles);
    await expect(client.groups.oidc.getAssignedRoles(groupID)).resolves.toEqual({});

    await client.groups.oidc.assignRoles(groupID, roles);
    const assignedRoles = await client.groups.oidc.getAssignedRoles(groupID, true);
    expect(Object.keys(assignedRoles)).toEqual(expect.arrayContaining(roles));

    await client.groups.oidc.revokeRoles(groupID, roles);
    await expect(client.groups.oidc.getAssignedRoles(groupID)).resolves.toEqual({});
  });

  it('should get all known role groups', async () => {
    const client = await makeClient();
    const group1 = './group-1';
    const group2 = './group-2';

    await client.groups.oidc.assignRoles(group1, 'viewer');
    await client.groups.oidc.assignRoles(group2, 'viewer');

    await expect(client.groups.oidc.getKnownGroupNames()).resolves.toEqual(
      expect.arrayContaining([group1, group2])
    );

    await client.groups.oidc.revokeRoles(group1, 'viewer');
    await client.groups.oidc.revokeRoles(group2, 'viewer');

    await expect(client.groups.oidc.getKnownGroupNames()).resolves.toHaveLength(0);
  });

  it('should get group assignments', async () => {
    const client = await makeClient();
    const roleName = 'test_group_assignements_role';
    await client.roles.delete(roleName).catch((e) => {});
    await client.roles.create(roleName, []).catch((e) => {});

    await expect(client.roles.getGroupAssignments(roleName)).resolves.toHaveLength(0);

    await client.groups.oidc.assignRoles('./group-1', roleName);
    await client.groups.oidc.assignRoles('./group-2', roleName);
    await expect(client.roles.getGroupAssignments(roleName)).resolves.toEqual(
      expect.arrayContaining<GroupAssignment>([
        { groupID: './group-1', groupType: 'oidc' },
        { groupID: './group-2', groupType: 'oidc' },
      ])
    );

    await client.groups.oidc.revokeRoles('./group-1', roleName);
    await client.groups.oidc.revokeRoles('./group-2', roleName);
    await expect(client.roles.getGroupAssignments(roleName)).resolves.toHaveLength(0);
  });

  it('cleanup', async () => {
    await makeClient().then((c) => {
      c.groups.oidc.revokeRoles('./assign-group', ['viewer', 'admin']).catch((e) => {});
      c.groups.oidc.revokeRoles('./group-1', 'viewer').catch((e) => {});
      c.groups.oidc.revokeRoles('./group-2', 'viewer').catch((e) => {});
    });
  });
});
