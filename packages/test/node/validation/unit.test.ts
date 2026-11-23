import type Connection from '@weaviate/core/connection/index.js';
import ClassificationsScheduler from '@weaviate/core/v2/classifications/scheduler.js';
import Checker from '@weaviate/core/v2/data/checker.js';
import Deleter from '@weaviate/core/v2/data/deleter.js';
import { ObjectsPath } from '@weaviate/core/v2/data/path.js';
import { DbVersionSupport } from '@weaviate/core/utils/dbVersion';
import { describe, expect, it, vi } from 'vitest';
import { TestDbVersionProvider } from '../dbVersionProvider';

const id = 'd2dbb6c5-9a65-4a1a-9ae4-8f6e1a4a5c1d';

const makeClient = () => ({
  delete: vi.fn().mockResolvedValue(undefined),
  head: vi.fn().mockResolvedValue(true),
  postReturn: vi.fn().mockResolvedValue({ id: 'classification-1' }),
});

const asConnection = (client: ReturnType<typeof makeClient>) => client as unknown as Connection;

const makeObjectsPath = () => new ObjectsPath(new DbVersionSupport(new TestDbVersionProvider('1.25.0')));

describe('Unit testing of v2 builders reporting validation errors', () => {
  describe('data.deleter', () => {
    it('should reject with a validation error, and not send a request, when the id is not set', async () => {
      const client = makeClient();
      const deleter = new Deleter(asConnection(client), makeObjectsPath()).withClassName('Article');

      await expect(deleter.do()).rejects.toThrow('invalid usage: id must be set - set with .withId(id)');
      expect(client.delete).not.toHaveBeenCalled();
    });

    it('should still send the request when the id is set', async () => {
      const client = makeClient();
      const deleter = new Deleter(asConnection(client), makeObjectsPath())
        .withClassName('Article')
        .withId(id);

      await deleter.do();

      expect(client.delete).toHaveBeenCalledTimes(1);
      expect(client.delete.mock.calls[0][0]).toContain(id);
    });
  });

  describe('data.checker', () => {
    it('should reject with a validation error, and not send a request, when the id is not set', async () => {
      const client = makeClient();
      const checker = new Checker(asConnection(client), makeObjectsPath()).withClassName('Article');

      await expect(checker.do()).rejects.toThrow('invalid usage: id must be set - set with .withId(id)');
      expect(client.head).not.toHaveBeenCalled();
    });

    it('should still send the request when the id is set', async () => {
      const client = makeClient();
      const checker = new Checker(asConnection(client), makeObjectsPath())
        .withClassName('Article')
        .withId(id);

      await expect(checker.do()).resolves.toEqual(true);

      expect(client.head).toHaveBeenCalledTimes(1);
      expect(client.head.mock.calls[0][0]).toContain(id);
    });
  });

  describe('classifications.scheduler', () => {
    it('should reject with validation errors, and not send a request, when required fields are not set', async () => {
      const client = makeClient();
      const scheduler = new ClassificationsScheduler(asConnection(client));

      await expect(scheduler.do()).rejects.toThrow(
        /^invalid usage: className must be set.*classifyProperties must be set.*basedOnProperties must be set/
      );
      expect(client.postReturn).not.toHaveBeenCalled();
    });

    it('should still send the request when the required fields are set', async () => {
      const client = makeClient();
      const scheduler = new ClassificationsScheduler(asConnection(client))
        .withClassName('Article')
        .withClassifyProperties(['hasPopularity'])
        .withBasedOnProperties(['summary'])
        .withType('knn');

      await expect(scheduler.do()).resolves.toEqual({ id: 'classification-1' });

      expect(client.postReturn).toHaveBeenCalledTimes(1);
      expect(client.postReturn.mock.calls[0][0]).toEqual('/classifications');
    });
  });
});
