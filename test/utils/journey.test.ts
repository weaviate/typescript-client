import { describe, expect, it } from 'vitest';
import { DbVersionProvider, DbVersionSupport } from '../../src/utils/dbVersion.js';

const EMPTY_VERSION = '';
const VERSION_1 = '1.2.3';
const VERSION_2 = '2.3.4';

describe('db version provider', () => {
  it('should return empty version', () => {
    const versionGetter = () => Promise.resolve(EMPTY_VERSION);
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    return dbVersionProvider.getVersionString().then((version) => expect(version).toBe(EMPTY_VERSION));
  });

  it('should return proper version', () => {
    const versionGetter = () => Promise.resolve(VERSION_1);
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    return dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_1));
  });

  it('should return new version after refresh', async () => {
    let callsCounter = 0;
    const versionGetter = () => {
      callsCounter += 1;
      switch (callsCounter) {
        case 1:
          return Promise.resolve(VERSION_1);
        case 2:
          return Promise.resolve(VERSION_2);
        default:
          expect.unreachable('should not be called more then 2 times');
      }
    };
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_1));
    await dbVersionProvider.refresh(true);
    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_2));
  });

  it('should fetch version once', async () => {
    let callsCounter = 0;
    const versionGetter = () => {
      callsCounter += 1;
      switch (callsCounter) {
        case 1:
          return Promise.resolve(VERSION_1);
        default:
          expect.unreachable('should not be called more then 1 time');
      }
    };
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_1));
    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_1));
    await dbVersionProvider.getVersion().then((version) => expect(version.show()).toBe(VERSION_1));

    expect(callsCounter).toBe(1);
  });

  it('should fetch version until success', async () => {
    let callsCounter = 0;
    const versionGetter = () => {
      callsCounter += 1;
      switch (callsCounter) {
        case 1:
        case 2:
          return Promise.resolve(EMPTY_VERSION);
        case 3:
          return Promise.resolve(VERSION_1);
        default:
          expect.unreachable('should not be called more then 3 times');
      }
    };
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(EMPTY_VERSION));
    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(EMPTY_VERSION));
    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_1));
    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_1));
    await dbVersionProvider.getVersionString().then((version) => expect(version).toBe(VERSION_1));

    expect(callsCounter).toBe(3);
  });
});

describe('db version support', () => {
  it('should not support', () => {
    const notSupportedVersions = ['0.11', '1.13.9', '1.13', '1.0'];
    notSupportedVersions.forEach(async (version) => {
      const dbVersionProvider = new DbVersionProvider(() => Promise.resolve(version));
      const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

      const support = await dbVersionSupport.supportsClassNameNamespacedEndpointsPromise();
      expect(support.supports).toBe(false);
      expect(support.version).toBe(version);
    });
  });

  it('should support', () => {
    const supportedVersions = [
      {
        in: '1.14.0',
        exp: '1.14.0',
      },
      {
        in: '1.14.9',
        exp: '1.14.9',
      },
      {
        in: '1.100',
        exp: '1.100',
      },
      {
        in: '2.0',
        exp: '2.0',
      },
      {
        in: '10.11.12',
        exp: '10.11.12',
      },
      {
        in: '1.25.0-raft',
        exp: '1.25.0',
      },
    ];
    return supportedVersions.forEach(async (version) => {
      const dbVersionProvider = new DbVersionProvider(() => Promise.resolve(version.in));
      const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

      const support = await dbVersionSupport.supportsClassNameNamespacedEndpointsPromise();

      expect(support.supports).toBe(true);
      expect(support.version).toBe(version.exp);
    });
  });
});
