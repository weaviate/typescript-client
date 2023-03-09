import { DbVersionProvider } from "../test/dbVersionProvider"
import { DbVersionSupport } from "../utils/dbVersion"
import { ObjectsPath, ReferencesPath } from "./path"

// This can be anything > 1.14.2, to support class-namespaced urls.
// The actual value is not used for anything else
const version = "1.18.0"

const objectsPathBuilder = new ObjectsPath(
  new DbVersionSupport(
    new DbVersionProvider(version)
  )
);

const refsPathBuilder = new ReferencesPath(
  new DbVersionSupport(
    new DbVersionProvider(version)
  )
);

describe("paths", () => {
  it("builds object create", () => {
    return objectsPathBuilder.buildCreate("ONE")
      .then(path => expect(path).toEqual("/objects?consistency_level=ONE"))
      .catch(e => fail(`unexpected error: ${e}`));
  })

  it("builds object delete", () => {
    return objectsPathBuilder.buildDelete("123456", "SomeClass", "ALL")
      .then(path => expect(path).toEqual("/objects/SomeClass/123456?consistency_level=ALL"))
      .catch(e => fail(`unexpected error: ${e}`));
  })

  it("builds object merge", () => {
    return objectsPathBuilder.buildMerge("123456", "SomeClass", "QUORUM")
      .then(path => expect(path).toEqual("/objects/SomeClass/123456?consistency_level=QUORUM"))
      .catch(e => fail(`unexpected error: ${e}`));
  })

  it("builds object update", () => {
    return objectsPathBuilder.buildUpdate("123456", "SomeClass", "ONE")
      .then(path => expect(path).toEqual("/objects/SomeClass/123456?consistency_level=ONE"))
      .catch(e => fail(`unexpected error: ${e}`));
  })

  it("builds references", () => {
    return refsPathBuilder.build("123456", "SomeClass", "SomeProp", "ALL")
      .then(path => expect(path).toEqual("/objects/SomeClass/123456/references/SomeProp?consistency_level=ALL"))
      .catch(e => fail(`unexpected error: ${e}`));
  })
})
