import Connection from '../../connection/grpc.js';

import { WeaviateObject, BatchReference, BatchReferenceResponse } from '../../openapi/types.js';
import { buildRefsPath } from '../../batch/path.js';
import { ObjectsPath, ReferencesPath } from '../../data/path.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { Checker, ConsistencyLevel } from '../../data/index.js';
import { referenceToBeacons } from '../references/utils.js';
import { DataGuards, Serialize } from '../serialize/index.js';
import {
  BatchObjectsReturn,
  BatchReferencesReturn,
  DataObject,
  DeleteManyReturn,
  ErrorReference,
  NonReferenceInputs,
  Properties,
  ReferenceInput,
  ReferenceInputs,
  Vectors,
} from '../types/index.js';
import { FilterValue } from '../filters/index.js';
import { Deserialize } from '../deserialize/index.js';

/** The available options to the `data.deleteMany` method.  */
export type DeleteManyOptions<V> = {
  /** Whether to return verbose information about the operation */
  verbose?: V;
  /** Whether to perform a dry run of the operation */
  dryRun?: boolean;
};

/** The available options to the `data.insert` method. */
export type InsertObject<T> = {
  /** The ID of the object to be inserted. If not provided, a new ID will be generated. */
  id?: string;
  /** The properties of the object to be inserted */
  properties?: NonReferenceInputs<T>;
  /** The references of the object to be inserted */
  references?: ReferenceInputs<T>;
  /** The vector(s) of the object to be inserted */
  vectors?: number[] | Vectors;
};

/** The arguments of the `data.referenceX` methods */
export type ReferenceArgs<T> = {
  /** The ID of the object that will have the reference */
  fromUuid: string;
  /** The property of the object that will have the reference */
  fromProperty: string;
  /** The object(s) to reference */
  to: ReferenceInput<T>;
};

/** The available options to the `data.replace` method. */
export type ReplaceObject<T> = {
  /** The ID of the object to be replaced */
  id: string;
  /** The properties of the object to be replaced */
  properties?: NonReferenceInputs<T>;
  /** The references of the object to be replaced */
  references?: ReferenceInputs<T>;
  //* The vector(s) to replace in the object */
  vectors?: number[] | Vectors;
};

/** The available options to the `data.update` method. */
export type UpdateObject<T> = {
  /** The ID of the object to be updated */
  id: string;
  /** The properties of the object to be updated */
  properties?: NonReferenceInputs<T>;
  /** The references of the object to be updated */
  references?: ReferenceInputs<T>;
  //* The vector(s) to update in the object */
  vectors?: number[] | Vectors;
};

export interface Data<T> {
  deleteById: (id: string) => Promise<boolean>;
  deleteMany: <V extends boolean = false>(
    where: FilterValue,
    opts?: DeleteManyOptions<V>
  ) => Promise<DeleteManyReturn<V>>;
  exists: (id: string) => Promise<boolean>;
  /**
   * Insert a single object into the collection.
   *
   * If you don't provide any options to the function, then an empty object will be created.
   *
   * @param {InsertArgs<T> | NonReferenceInputs<T>} [args] The object to insert. If an `id` is provided, it will be used as the object's ID. If not, a new ID will be generated.
   * @returns {Promise<string>} The ID of the inserted object.
   */
  insert: (obj?: InsertObject<T> | NonReferenceInputs<T>) => Promise<string>;
  /**
   * Insert multiple objects into the collection.
   *
   * This object does not perform any batching for you. It sends all objects in a single request to Weaviate.
   *
   * @param {(DataObject<T> | NonReferenceInputs<T>)[]} objects The objects to insert.
   * @returns {Promise<BatchObjectsReturn<T>>} The result of the batch insert.
   */
  insertMany: (objects: (DataObject<T> | NonReferenceInputs<T>)[]) => Promise<BatchObjectsReturn<T>>;
  /**
   * Create a reference between an object in this collection and any other object in Weaviate.
   *
   * @param {ReferenceArgs<P>} args The reference to create.
   * @returns {Promise<void>}
   */
  referenceAdd: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  /**
   * Create multiple references between an object in this collection and any other object in Weaviate.
   *
   * This method is optimized for performance and sends all references in a single request.
   *
   * @param {ReferenceArgs<P>[]} refs The references to create.
   * @returns {Promise<BatchReferencesReturn>} The result of the batch reference creation.
   */
  referenceAddMany: <P extends Properties>(refs: ReferenceArgs<P>[]) => Promise<BatchReferencesReturn>;
  /**
   * Delete a reference between an object in this collection and any other object in Weaviate.
   *
   * @param {ReferenceArgs<P>} args The reference to delete.
   * @returns {Promise<void>}
   */
  referenceDelete: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  /**
   * Replace a reference between an object in this collection and any other object in Weaviate.
   *
   * @param {ReferenceArgs<P>} args The reference to replace.
   * @returns {Promise<void>}
   */
  referenceReplace: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  /**
   * Replace an object in the collection.
   *
   * This is equivalent to a PUT operation.
   *
   * @param {ReplaceOptions<T>} [opts] The object attributes to replace.
   * @returns {Promise<void>}
   */
  replace: (obj: ReplaceObject<T>) => Promise<void>;
  /**
   * Update an object in the collection.
   *
   * This is equivalent to a PATCH operation.
   *
   * @param {UpdateArgs<T>} [opts] The object attributes to replace.
   * @returns {Promise<void>}
   */
  update: (obj: UpdateObject<T>) => Promise<void>;
}

interface IBuilder {
  withConsistencyLevel(consistencyLevel: ConsistencyLevel): this;
  withTenant(tenant: string): this;
}

const addContext = <B extends IBuilder>(
  builder: B,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
): B => {
  if (consistencyLevel) {
    builder = builder.withConsistencyLevel(consistencyLevel);
  }
  if (tenant) {
    builder = builder.withTenant(tenant);
  }
  return builder;
};

const data = <T>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
): Data<T> => {
  const objectsPath = new ObjectsPath(dbVersionSupport);
  const referencesPath = new ReferencesPath(dbVersionSupport);

  const parseObject = (object?: InsertObject<any>): WeaviateObject<T> => {
    if (!object) {
      return {} as WeaviateObject<T>;
    }
    const obj: WeaviateObject<T> = {
      id: object.id,
      properties: object.properties
        ? (Serialize.restProperties(object.properties, object.references) as T)
        : undefined,
    };
    if (Array.isArray(object.vectors)) {
      obj.vector = object.vectors;
    } else if (object.vectors) {
      obj.vectors = object.vectors;
    }
    return obj;
  };

  return {
    deleteById: (id: string): Promise<boolean> =>
      objectsPath
        .buildDelete(id, name, consistencyLevel, tenant)
        .then((path) => connection.delete(path, undefined, false))
        .then(() => true),
    deleteMany: <V extends boolean>(
      where: FilterValue,
      opts?: DeleteManyOptions<V>
    ): Promise<DeleteManyReturn<V>> =>
      connection
        .batch(name, consistencyLevel, tenant)
        .then((batch) =>
          batch.withDelete({
            filters: Serialize.filtersGRPC(where),
            dryRun: opts?.dryRun,
            verbose: opts?.verbose,
          })
        )
        .then((reply) => Deserialize.deleteMany(reply, opts?.verbose)),
    exists: (id: string): Promise<boolean> =>
      addContext(
        new Checker(connection, objectsPath).withId(id).withClassName(name),
        consistencyLevel,
        tenant
      ).do(),
    insert: (obj?: InsertObject<T> | NonReferenceInputs<T>): Promise<string> =>
      objectsPath
        .buildCreate(consistencyLevel)
        .then((path) =>
          connection.postReturn<WeaviateObject<T>, Required<WeaviateObject<T>>>(path, {
            class: name,
            tenant: tenant,
            ...parseObject(
              obj ? (DataGuards.isDataObject(obj) ? obj : ({ properties: obj } as InsertObject<T>)) : obj
            ),
          })
        )
        .then((obj) => obj.id),
    insertMany: (objects: (DataObject<T> | NonReferenceInputs<T>)[]): Promise<BatchObjectsReturn<T>> =>
      connection.batch(name, consistencyLevel).then(async (batch) => {
        const serialized = await Serialize.batchObjects(name, objects, tenant);
        const start = Date.now();
        const reply = await batch.withObjects({ objects: serialized.mapped });
        const end = Date.now();
        return Deserialize.batchObjects<T>(reply, serialized.batch, serialized.mapped, end - start);
      }),
    referenceAdd: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) =>
          Promise.all(referenceToBeacons(args.to).map((beacon) => connection.postEmpty(path, beacon)))
        )
        .then(() => {}),
    referenceAddMany: <P extends Properties>(refs: ReferenceArgs<P>[]): Promise<BatchReferencesReturn> => {
      const path = buildRefsPath(
        new URLSearchParams(consistencyLevel ? { consistency_level: consistencyLevel } : {})
      );
      const references: BatchReference[] = [];
      refs.forEach((ref) => {
        referenceToBeacons(ref.to).forEach((beacon) => {
          references.push({
            from: `weaviate://localhost/${name}/${ref.fromUuid}/${ref.fromProperty}`,
            to: beacon.beacon,
            tenant: tenant,
          });
        });
      });
      const start = Date.now();
      return connection
        .postReturn<BatchReference[], BatchReferenceResponse[]>(path, references)
        .then((res) => {
          const end = Date.now();
          const errors: Record<number, ErrorReference> = {};
          res.forEach((entry, idx) => {
            if (entry.result?.status === 'FAILED') {
              errors[idx] = {
                message: entry.result?.errors?.error?.[0].message
                  ? entry.result?.errors?.error?.[0].message
                  : 'unknown error',
                reference: references[idx],
              };
            }
          });
          return {
            elapsedSeconds: end - start,
            errors: errors,
            hasErrors: Object.keys(errors).length > 0,
          };
        });
    },
    referenceDelete: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) =>
          Promise.all(referenceToBeacons(args.to).map((beacon) => connection.delete(path, beacon, false)))
        )
        .then(() => {}),
    referenceReplace: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) => connection.put(path, referenceToBeacons(args.to), false)),
    replace: (obj: ReplaceObject<T>): Promise<void> =>
      objectsPath.buildUpdate(obj.id, name, consistencyLevel).then((path) =>
        connection.put(path, {
          class: name,
          tenant: tenant,
          ...parseObject(obj),
        })
      ),
    update: (obj: UpdateObject<T>): Promise<void> =>
      objectsPath.buildUpdate(obj.id, name, consistencyLevel).then((path) =>
        connection.patch(path, {
          class: name,
          tenant: tenant,
          ...parseObject(obj),
        })
      ),
  };
};

export default data;
