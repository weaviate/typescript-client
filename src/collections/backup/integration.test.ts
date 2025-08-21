/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable no-await-in-loop */
import { requireAtLeast } from '../../../test/version.js';
import { Backend } from '../../backup/index.js';
import weaviate, { Collection, WeaviateClient } from '../../index.js';

// These must run sequentially because Weaviate is not capable of running multiple backups at the same time
describe('Integration testing of backups', () => {
  const clientPromise = weaviate.connectToLocal({
    port: 8090,
    grpcPort: 50061,
  });

  const getCollection = (client: WeaviateClient) => client.collections.use('TestBackupCollection');

  beforeAll(() =>
    clientPromise.then((client) =>
      Promise.all([
        client.collections.create({ name: 'TestBackupClient' }).then((col) => col.data.insert()),
        client.collections.create({ name: 'TestBackupCollection' }).then((col) => col.data.insert()),
      ])
    )
  );

  afterAll(() => clientPromise.then((client) => client.collections.deleteAll()));

  const testClientWaitForCompletion = async (client: WeaviateClient) => {
    const res = await client.backup.create({
      backupId: `test-backup-${randomBackupId()}`,
      backend: 'filesystem',
      waitForCompletion: true,
    });
    expect(res.status).toBe('SUCCESS');
    return client;
  };

  const testClientNoWaitForCompletion = async (client: WeaviateClient) => {
    const res = await client.backup.create({
      backupId: `test-backup-${randomBackupId()}`,
      backend: 'filesystem',
    });
    expect(res.status).toBe('STARTED');
    const status = await client.backup.getCreateStatus({
      backupId: res.id as string,
      backend: res.backend as 'filesystem',
    });
    expect(status).not.toBe('SUCCESS'); // can be 'STARTED' or 'TRANSFERRING' depending on the speed of the test machine

    // wait to complete so that other tests can run without colliding with Weaviate's lack of simultaneous backups
    let wait = true;
    while (wait) {
      const { status, error } = await client.backup.getCreateStatus({
        backupId: res.id as string,
        backend: res.backend as Backend,
      });
      if (status === 'SUCCESS') {
        wait = false;
      }
      if (status === 'FAILED') {
        throw new Error(`Backup creation failed: ${error}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return client;
  };

  const testCollectionWaitForCompletion = async (collection: Collection) => {
    const res = await collection.backup.create({
      backupId: `test-backup-${randomBackupId()}`,
      backend: 'filesystem',
      waitForCompletion: true,
    });
    expect(res.status).toBe('SUCCESS');
    expect(res.collections).toEqual(['TestBackupCollection']);
    return collection;
  };

  const testCollectionNoWaitForCompletion = async (collection: Collection) => {
    const res = await collection.backup.create({
      backupId: `test-backup-${randomBackupId()}`,
      backend: 'filesystem',
    });
    expect(res.status).toBe('STARTED');
    expect(res.collections).toEqual(['TestBackupCollection']);
    const status = await collection.backup.getCreateStatus({
      backupId: res.id as string,
      backend: res.backend as 'filesystem',
    });
    expect(status).not.toBe('SUCCESS'); // can be 'STARTED' or 'TRANSFERRING' depending on the speed of the test machine

    // wait to complete so that other tests can run without colliding with Weaviate's lack of simultaneous backups
    let wait = true;
    while (wait) {
      const { status, error } = await collection.backup.getCreateStatus({
        backupId: res.id as string,
        backend: res.backend as Backend,
      });
      if (status === 'SUCCESS') {
        wait = false;
      }
      if (status === 'FAILED') {
        throw new Error(`Backup creation failed: ${error}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return collection;
  };

  it('run', () =>
    clientPromise
      .then(testClientWaitForCompletion)
      .then(testClientNoWaitForCompletion)
      .then(getCollection)
      .then(testCollectionWaitForCompletion)
      .then(testCollectionNoWaitForCompletion));

  requireAtLeast(1, 32, 0).it('get all exising backups', async () => {
    await clientPromise.then(async (client) => {
      await client.collections.create({ name: 'TestListBackups' }).then((col) => col.data.insert());

      const wantBackups: string[] = [];
      for (let i = 0; i < 3; i++) {
        wantBackups.push(
          await client.backup
            .create({
              backupId: randomBackupId(),
              backend: 'filesystem',
              includeCollections: ['TestListBackups'],
              waitForCompletion: true,
            })
            .then((res) => res.id)
        );
      }

      const gotBackups: string[] = await client.backup
        .list('filesystem')
        .then((res) => res.map((bu) => bu.id));

      // There may be other backups created in other tests;
      expect(gotBackups.length).toBeGreaterThanOrEqual(wantBackups.length);
      expect(gotBackups).toEqual(expect.arrayContaining(wantBackups));
    });
  });

  function randomBackupId() {
    return 'backup-id-' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }
});
