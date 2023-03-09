const weaviate = require("../index");
const { createTestFoodSchemaAndData, cleanupTestFood, PIZZA_CLASS_NAME, SOUP_CLASS_NAME } = require("../utils/testData");

const DOCKER_COMPOSE_BACKUPS_DIR = "/tmp/backups";

describe("create and restore backup with waiting", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("asserts data exist", () => assertThatAllPizzasExist(client));

  it("creates backup", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .then(createResponse => {
        expect(createResponse.id).toBe(BACKUP_ID);
        expect(createResponse.classes).toHaveLength(1)
        expect(createResponse.classes).toContain(PIZZA_CLASS_NAME);
        expect(createResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(createResponse.backend).toBe(BACKEND);
        expect(createResponse.status).toBe(weaviate.backup.CreateStatus.SUCCESS);
        expect(createResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on create backup: " + err));
  });

  it("asserts data still exist", () => assertThatAllPizzasExist(client));

  it("checks create status", () => {
    return client.backup.createStatusGetter()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(createStatusResponse => {
        expect(createStatusResponse.id).toBe(BACKUP_ID);
        expect(createStatusResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(createStatusResponse.backend).toBe(BACKEND);
        expect(createStatusResponse.status).toBe(weaviate.backup.CreateStatus.SUCCESS);
        expect(createStatusResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on create status: " + err));
  });

  it("removes existing class", () => {
    return client.schema.classDeleter()
      .withClassName(PIZZA_CLASS_NAME)
      .do()
      .catch(err => fail("should not fail on class delete: " + err));
  });

  it("restores backup", () => {
    return client.backup.restorer()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .then(restoreResponse => {
        expect(restoreResponse.id).toBe(BACKUP_ID);
        expect(restoreResponse.classes).toHaveLength(1)
        expect(restoreResponse.classes).toContain(PIZZA_CLASS_NAME);
        expect(restoreResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(restoreResponse.backend).toBe(BACKEND);
        expect(restoreResponse.status).toBe(weaviate.backup.RestoreStatus.SUCCESS);
        expect(restoreResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on restore backup: " + err));
  });

  it("asserts data again exist", () => assertThatAllPizzasExist(client));

  it("checks restore status", () => {
    return client.backup.restoreStatusGetter()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(restoreStatusResponse => {
        expect(restoreStatusResponse.id).toBe(BACKUP_ID);
        expect(restoreStatusResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(restoreStatusResponse.backend).toBe(BACKEND);
        expect(restoreStatusResponse.status).toBe(weaviate.backup.RestoreStatus.SUCCESS);
        expect(restoreStatusResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on restore status: " + err));
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("create and restore backup without waiting", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("asserts data exist", () => assertThatAllPizzasExist(client));

  it("creates backup", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(createResponse => {
        expect(createResponse.id).toBe(BACKUP_ID);
        expect(createResponse.classes).toHaveLength(1)
        expect(createResponse.classes).toContain(PIZZA_CLASS_NAME);
        expect(createResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(createResponse.backend).toBe(BACKEND);
        expect(createResponse.status).toBe(weaviate.backup.CreateStatus.STARTED);
        expect(createResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on create backup: " + err));
  });

  it("waits until created", () => {
    return new Promise((resolve, reject) => {
      const statusGetter = client.backup.createStatusGetter()
        .withBackend(BACKEND)
        .withBackupId(BACKUP_ID);
      const loop = () => {
        statusGetter.do()
          .then(createStatusResponse => {
            if (createStatusResponse.status == weaviate.backup.CreateStatus.SUCCESS || createStatusResponse.status == weaviate.backup.CreateStatus.FAILED) {
              resolve(createStatusResponse);
            } else {
              setTimeout(loop, 100);
            }
          })
          .catch(reject);
      };
      loop();
    })
    .then(createStatusResponse => {
      expect(createStatusResponse.id).toBe(BACKUP_ID);
      expect(createStatusResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
      expect(createStatusResponse.backend).toBe(BACKEND);
      expect(createStatusResponse.status).toBe(weaviate.backup.CreateStatus.SUCCESS);
      expect(createStatusResponse.error).toBeUndefined();
    })
    .catch(err => fail("should not fail on create status: " + err))
  })

  it("asserts data still exist", () => assertThatAllPizzasExist(client));

  it("removes existing class", () => {
    return client.schema.classDeleter()
      .withClassName(PIZZA_CLASS_NAME)
      .do()
      .catch(err => fail("should not fail on class delete: " + err));
  });

  it("restores backup", () => {
    return client.backup.restorer()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(restoreResponse => {
        expect(restoreResponse.id).toBe(BACKUP_ID);
        expect(restoreResponse.classes).toHaveLength(1)
        expect(restoreResponse.classes).toContain(PIZZA_CLASS_NAME);
        expect(restoreResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(restoreResponse.backend).toBe(BACKEND);
        expect(restoreResponse.status).toBe(weaviate.backup.RestoreStatus.STARTED);
        expect(restoreResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on restore backup: " + err));
  });

  it("waits until restored", () => {
    return new Promise((resolve, reject) => {
      const statusGetter = client.backup.restoreStatusGetter()
        .withBackend(BACKEND)
        .withBackupId(BACKUP_ID);
      const loop = () => {
        statusGetter.do()
          .then(restoreStatusResponse => {
            if (restoreStatusResponse.status == weaviate.backup.RestoreStatus.SUCCESS || restoreStatusResponse.status == weaviate.backup.RestoreStatus.FAILED) {
              resolve(restoreStatusResponse);
            } else {
              setTimeout(loop, 100);
            }
          })
          .catch(reject);
      };
      loop();
    })
    .then(restoreStatusResponse => {
      expect(restoreStatusResponse.id).toBe(BACKUP_ID);
      expect(restoreStatusResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
      expect(restoreStatusResponse.backend).toBe(BACKEND);
      expect(restoreStatusResponse.status).toBe(weaviate.backup.RestoreStatus.SUCCESS);
      expect(restoreStatusResponse.error).toBeUndefined();
    })
    .catch(err => fail("should not fail on restore backup: " + err));
  })

  it("asserts data again exist", () => assertThatAllPizzasExist(client));

  it("cleans up", () => cleanupTestFood(client));
});

describe("create and restore 1 of 2 classes", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("asserts data exist", () => Promise.all([
    assertThatAllPizzasExist(client),
    assertThatAllSoupsExist(client),
  ]));

  it("creates backup", () => {
    return client.backup.creator()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .then(createResponse => {
        expect(createResponse.id).toBe(BACKUP_ID);
        expect(createResponse.classes).toHaveLength(2)
        expect(createResponse.classes).toContain(PIZZA_CLASS_NAME);
        expect(createResponse.classes).toContain(SOUP_CLASS_NAME);
        expect(createResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(createResponse.backend).toBe(BACKEND);
        expect(createResponse.status).toBe(weaviate.backup.CreateStatus.SUCCESS);
        expect(createResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on create backup: " + err));
  });

  it("asserts data still exist", () => Promise.all([
    assertThatAllPizzasExist(client),
    assertThatAllSoupsExist(client),
  ]));

  it("checks create status", () => {
    return client.backup.createStatusGetter()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(createStatusResponse => {
        expect(createStatusResponse.id).toBe(BACKUP_ID);
        expect(createStatusResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(createStatusResponse.backend).toBe(BACKEND);
        expect(createStatusResponse.status).toBe(weaviate.backup.CreateStatus.SUCCESS);
        expect(createStatusResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on create status: " + err));
  });

  it("removes existing class", () => {
    return client.schema.classDeleter()
      .withClassName(PIZZA_CLASS_NAME)
      .do()
      .catch(err => fail("should not fail on class delete: " + err));
  });

  it("restores backup", () => {
    return client.backup.restorer()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .then(restoreResponse => {
        expect(restoreResponse.id).toBe(BACKUP_ID);
        expect(restoreResponse.classes).toHaveLength(1)
        expect(restoreResponse.classes).toContain(PIZZA_CLASS_NAME);
        expect(restoreResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(restoreResponse.backend).toBe(BACKEND);
        expect(restoreResponse.status).toBe(weaviate.backup.RestoreStatus.SUCCESS);
        expect(restoreResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on restore backup: " + err));
  });

  it("asserts data again exist", () => Promise.all([
    assertThatAllPizzasExist(client),
    assertThatAllSoupsExist(client),
  ]));

  it("checks restore status", () => {
    return client.backup.restoreStatusGetter()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(restoreStatusResponse => {
        expect(restoreStatusResponse.id).toBe(BACKUP_ID);
        expect(restoreStatusResponse.path).toBe(`${DOCKER_COMPOSE_BACKUPS_DIR}/${BACKUP_ID}`);
        expect(restoreStatusResponse.backend).toBe(BACKEND);
        expect(restoreStatusResponse.status).toBe(weaviate.backup.RestoreStatus.SUCCESS);
        expect(restoreStatusResponse.error).toBeUndefined();
      })
      .catch(err => fail("should not fail on restore status: " + err));
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail creating backup on not existing backend", () => {
  const BACKEND = "not-existing-backend";
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("fails creating", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on create backup"))
      .catch(err => {
        expect(err).toContain(422);
        expect(err).toContain(BACKEND);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail checking create status on not existing backend", () => {
  const BACKEND = "not-existing-backend";
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("fails checking create status", () => {
    return client.backup.createStatusGetter()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on create status"))
      .catch(err => {
        expect(err).toContain(422);
        expect(err).toContain(BACKEND);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail restoring backup on not existing backend", () => {
  const CLASS_NAME = "not-existing-class";
  const BACKEND = "not-existing-backend";
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("fails restoring", () => {
    return client.backup.restorer()
      .withIncludeClassNames(CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on restore backup"))
      .catch(err => {
        expect(err).toContain(422);
        expect(err).toContain(BACKEND);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail creating backup for not existing class", () => {
  const CLASS_NAME = "not-existing-class";
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("fails creating", () => {
    return client.backup.creator()
      .withIncludeClassNames(CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on create backup"))
      .catch(err => {
        expect(err).toContain(422);
        expect(err).toContain(CLASS_NAME);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail restoring backup for existing class", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("creates backup", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .catch(err => fail("should not fail on create backup: " + err));
  });

  it("fails restoring", () => {
    return client.backup.restorer()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .then(resp => {
        expect(resp.error).toContain("already exists");
        expect(resp.error).toContain(PIZZA_CLASS_NAME);
        expect(resp.status).toBe(weaviate.backup.RestoreStatus.FAILED);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail creating existing backup", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("creates backup", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .catch(err => fail("should not fail on create backup: " + err));
  });

  it("fails creating", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on create backup"))
      .catch(err => {
        expect(err).toContain(422);
        expect(err).toContain(BACKUP_ID);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail checking create status for not existing backup", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("fails checking create status", () => {
    return client.backup.createStatusGetter()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on create status"))
      .catch(err => {
        expect(err).toContain(404);
        expect(err).toContain(BACKUP_ID);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail restoring not existing backup", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("fails restoring", () => {
    return client.backup.restorer()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on restore backup"))
      .catch(err => {
        expect(err).toContain(404);
        expect(err).toContain(BACKUP_ID);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail checking restore status for not started restore", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("creates backup", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .catch(err => fail("should not fail on create backup: " + err));
  });

  it("fails checking restore status", () => {
    return client.backup.restoreStatusGetter()
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on restore status"))
      .catch(err => {
        expect(err).toContain(404);
        expect(err).toContain(BACKUP_ID);
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail creating backup for both include and exclude classes", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("fails creating backup", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withExcludeClassNames(SOUP_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .then(() => fail("should fail on create"))
      .catch(err => {
        expect(err).toContain(422);
        expect(err).toContain("include");
        expect(err).toContain("exclude");
      });
  });

  it("cleans up", () => cleanupTestFood(client));
});

describe("fail restoring backup for both include and exclude classes", () => {
  const BACKEND = weaviate.backup.Backend.FILESYSTEM;
  const BACKUP_ID = randomBackupId()

  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  it("sets up", () => createTestFoodSchemaAndData(client));

  it("creates backup", () => {
    return client.backup.creator()
      .withIncludeClassNames(PIZZA_CLASS_NAME, SOUP_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .withWaitForCompletion(true)
      .do()
      .catch(err => fail("should not fail on create backup: " + err));
  });

  it("removes existing class", () => {
    return client.schema.classDeleter()
      .withClassName(PIZZA_CLASS_NAME)
      .do()
      .catch(err => fail("should not fail on class delete: " + err));
  });

  it("fails restoring backup", () => {
    return client.backup.restorer()
      .withIncludeClassNames(PIZZA_CLASS_NAME)
      .withExcludeClassNames(SOUP_CLASS_NAME)
      .withBackend(BACKEND)
      .withBackupId(BACKUP_ID)
      .do()
      .then(() => fail("should fail on restore"))
      .catch(err => {
        expect(err).toContain(422);
        expect(err).toContain("include");
        expect(err).toContain("exclude");
      });
  });

  it("cleans up", () => cleanupTestFood(client).catch(() => Promise.resolve("ignore not exising Pizza")));
});

// describe("get all exising backups", () => {
//   const BACKEND = weaviate.backup.Backend.FILESYSTEM;
//   const BACKUP_ID = randomBackupId()
//   const BACKUP_ID_PIZZA = BACKUP_ID + "-pizza";
//   const BACKUP_ID_SOUP = BACKUP_ID + "-soup";

//   const client = weaviate.client({
//     scheme: "http",
//     host: "localhost:8080",
//   });

//   it("sets up", () => createTestFoodSchemaAndData(client));

//   it("creates backup pizza", () => {
//     return client.backup.creator()
//       .withIncludeClassNames(PIZZA_CLASS_NAME)
//       .withBackend(BACKEND)
//       .withBackupId(BACKUP_ID_PIZZA)
//       .withWaitForCompletion(true)
//       .do()
//       .catch(err => fail("should not fail on create backup: " + err));
//   });

//   it("creates backup soup", () => {
//     return client.backup.creator()
//       .withIncludeClassNames(SOUP_CLASS_NAME)
//       .withBackend(BACKEND)
//       .withBackupId(BACKUP_ID_SOUP)
//       .withWaitForCompletion(true)
//       .do()
//       .catch(err => fail("should not fail on create backup: " + err));
//   });

//   it("get all", () => {
//     return client.backup.getter()
//       .withBackend(BACKEND)
//       .do()
//       .then(allResponse => {
//         expect(allResponse).toHaveLength(2);
//         expect(allResponse).toEqual(expect.arrayContaining([
//           expect.objectContaining({id: BACKUP_ID_PIZZA}),
//           expect.objectContaining({id: BACKUP_ID_SOUP}),
//         ]));
//       })
//       .catch(err => fail("should not fail on getting all: " + err));
//   });

//   it("cleans up", () => cleanupTestFood(client));
// });


function assertThatAllPizzasExist(client) {
  return assertThatAllFoodObjectsExist(client, "Pizza", 4);
}

function assertThatAllSoupsExist(client) {
  return assertThatAllFoodObjectsExist(client, "Soup", 2);
}

function assertThatAllFoodObjectsExist(client, className, number) {
  return client.graphql.get()
    .withClassName(className)
    .withFields("name")
    .do()
    .then(data => expect(data.data.Get[className].length).toBe(number))
    .catch(err => fail(number + " objects should exist: " + err));
}

function randomBackupId() {
  return "backup-id-" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}
