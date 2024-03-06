import Connection from '../../connection/grpc';

import { WeaviateObject, BatchReference, BatchReferenceResponse } from '../../openapi/types';
import { buildRefsPath } from '../../batch/path';
import { ObjectsPath, ReferencesPath } from '../../data/path';
import { DbVersionSupport } from '../../utils/dbVersion';
import { Checker, ConsistencyLevel } from '../../data';
import { ReferenceManager, referenceToBeacons } from '../references';
import Serialize, { DataGuards } from '../serialize';
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
} from '../types';
import { FilterValue } from '../filters';
import Deserialize from '../deserialize';

import { addContext } from '..';

export type DeleteManyOptions<V> = {
  verbose?: V;
  dryRun?: boolean;
};

export type InsertArgs<T> = {
  id?: string;
  properties?: NonReferenceInputs<T>;
  references?: ReferenceInputs<T>;
  vectors?: number[] | Vectors;
};

export type ReferenceArgs<T> = {
  fromUuid: string;
  fromProperty: string;
  to: ReferenceInput<T>;
};

export type ReferenceManyArgs<T> = {
  refs: ReferenceArgs<T>[];
};

export type ReplaceArgs<T> = {
  id: string;
  properties?: T;
  vector?: number[];
};

export type UpdateArgs<T> = ReplaceArgs<T>;

export type InsertObject<T> = InsertArgs<T>;

export type BatchDeleteResult = {
  failed: number;
  matches: number;
  objects?: Record<string, any>[];
  successful: number;
};

export interface Data<T> {
  delete: (id: string) => Promise<boolean>;
  deleteMany: <V extends boolean = false>(
    where: FilterValue,
    opts?: DeleteManyOptions<V>
  ) => Promise<DeleteManyReturn<V>>;
  exists: (id: string) => Promise<boolean>;
  insert: (args: InsertArgs<T> | NonReferenceInputs<T>) => Promise<string>;
  insertMany: (objects: (DataObject<T> | NonReferenceInputs<T>)[]) => Promise<BatchObjectsReturn<T>>;
  referenceAdd: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  referenceAddMany: <P extends Properties>(args: ReferenceManyArgs<P>) => Promise<BatchReferencesReturn>;
  referenceDelete: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  referenceReplace: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  replace: (args: ReplaceArgs<T>) => Promise<void>;
  update: (args: UpdateArgs<T>) => Promise<void>;
}

const data = <T>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
): Data<T> => {
  const objectsPath = new ObjectsPath(dbVersionSupport);
  const referencesPath = new ReferencesPath(dbVersionSupport);

  const parseObject = (object: any): WeaviateObject<T> => {
    return {
      id: object.id,
      properties: object.properties
        ? Serialize.restProperties(object.properties, object.references)
        : undefined,
      vector: object.vector,
    };
  };

  return {
    delete: (id: string): Promise<boolean> =>
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
    insert: (args: InsertArgs<T> | NonReferenceInputs<T>): Promise<string> =>
      objectsPath
        .buildCreate(consistencyLevel)
        .then((path) =>
          connection.postReturn<WeaviateObject<T>, Required<WeaviateObject<T>>>(path, {
            class: name,
            tenant: tenant,
            ...parseObject(DataGuards.isDataObject(args) ? args : ({ properties: args } as InsertObject<T>)),
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
        .then(() => {})
        .catch((err) => {
          throw err;
        }),
    referenceAddMany: <P extends Properties>(args: ReferenceManyArgs<P>): Promise<BatchReferencesReturn> => {
      const path = buildRefsPath(
        new URLSearchParams(consistencyLevel ? { consistency_level: consistencyLevel } : {})
      );
      const references: BatchReference[] = [];
      args.refs.forEach((ref) => {
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
        .then(() => {})
        .catch((err) => {
          throw err;
        }),
    referenceReplace: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) => connection.put(path, referenceToBeacons(args.to), false)),
    replace: (args: ReplaceArgs<T>): Promise<void> =>
      objectsPath.buildUpdate(args.id, name, consistencyLevel).then((path) =>
        connection.put(path, {
          class: name,
          tenant: tenant,
          ...parseObject(args),
        })
      ),
    update: (args: UpdateArgs<T>): Promise<void> =>
      objectsPath.buildUpdate(args.id, name, consistencyLevel).then((path) =>
        connection.patch(path, {
          class: name,
          tenant: tenant,
          ...parseObject(args),
        })
      ),
  };
};

export default data;
