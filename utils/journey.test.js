import { DbVersionProvider, DbVersionSupport } from "./dbVersion";

const EMPTY_VERSION = "";
const VERSION_1 = "1.2.3";
const VERSION_2 = "2.3.4";

describe("db version provider", () => {
  it("should return empty version", () => {
    const versionGetter = () => Promise.resolve(EMPTY_VERSION);
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    return dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(EMPTY_VERSION))
      .catch(() => fail("version should always resolve successfully"));
  });

  it("should return proper version", () => {
    const versionGetter = () => Promise.resolve(VERSION_1);
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    return dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));
  });

  it("should return new version after refresh",  async () => {
    let callsCounter = 0;
    const versionGetter = () => {
      switch(++callsCounter) {
        case 1:
          return Promise.resolve(VERSION_1);
        case 2:
          return Promise.resolve(VERSION_2);
        default:
          fail("should not be called more then 2 times");
      }
    };
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));
    await dbVersionProvider.refresh(true);
    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_2))
      .catch(() => fail("version should always resolve successfully"));
  });

  it("should fetch version once", async () => {
    let callsCounter = 0;
    const versionGetter = () => {
      switch(++callsCounter) {
        case 1:
          return Promise.resolve(VERSION_1);
        default:
          fail("should not be called more then 1 time");
      }
    };
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));
    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));
    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));

    expect(callsCounter).toBe(1);
  });

  it("should fetch version until success", async () => {
    let callsCounter = 0;
    const versionGetter = () => {
      switch(++callsCounter) {
        case 1:
        case 2:
          return Promise.resolve(EMPTY_VERSION);
        case 3:
          return Promise.resolve(VERSION_1);
        default:
          fail("should not be called more then 3 times");
      }
    };
    const dbVersionProvider = new DbVersionProvider(versionGetter);

    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(EMPTY_VERSION))
      .catch(() => fail("version should always resolve successfully"));
    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(EMPTY_VERSION))
      .catch(() => fail("version should always resolve successfully"));
    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));
    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));
    await dbVersionProvider.getVersionPromise()
      .then(version => expect(version).toBe(VERSION_1))
      .catch(() => fail("version should always resolve successfully"));

    expect(callsCounter).toBe(3);
  });
});


describe("db version support", () => {
  it("should not support", () => {
    const notSupportedVersions = ["0.11", "1.13.9", "1.13", "1.0"];
    notSupportedVersions.forEach(async version => {
      const dbVersionProvider = { getVersionPromise: () => Promise.resolve(version) };
      const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

      await dbVersionSupport.supportsClassNameNamespacedEndpointsPromise()
        .then(support => {
          expect(support.supports).toBe(false);
          expect(support.version).toBe(version);
        })
        .catch(() => fail("version should always resolve successfully"));
    });
  });

  it ("should support", () => {
    const supportedVersions = ["1.14.0", "1.14.9", "1.100", "2.0", "10.11.12"];
    supportedVersions.forEach(async version => {
      const dbVersionProvider = { getVersionPromise: () => Promise.resolve(version) };
      const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

      await dbVersionSupport.supportsClassNameNamespacedEndpointsPromise()
        .then(support => {
          expect(support.supports).toBe(true);
          expect(support.version).toBe(version);
        })
        .catch(() => fail("version should always resolve successfully"));
    });
  });
});
