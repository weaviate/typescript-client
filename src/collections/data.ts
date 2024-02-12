import Connection from '../connection';

import {
  WeaviateObject,
  BatchDeleteResponse,
  BatchReference,
  BatchReferenceResponse,
} from '../openapi/types';
import { buildObjectsPath, buildRefsPath } from '../batch/path';
import { ObjectsPath, ReferencesPath } from '../data/path';
import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';
import { ReferenceManager, uuidToBeacon } from './references';
import Serialize from './serialize';
import {
  BatchObjectsReturn,
  BatchReferencesReturn,
  DataObject,
  ErrorReference,
  NonReferenceInputs,
  Properties,
  ReferenceInputs,
  Refs,
} from './types';
import { FilterValue } from './filters';
import Deserialize from './deserialize';

export interface DeleteManyOptions {
  verbose?: boolean;
  dryRun?: boolean;
}

export interface InsertArgs<T> {
  id?: string;
  properties?: NonReferenceInputs<T>;
  references?: ReferenceInputs<T>;
  vector?: number[];
}

export interface ReferenceArgs<T extends Properties> {
  fromUuid: string;
  fromProperty: string;
  to: ReferenceManager<T>;
}

export interface ReferenceManyArgs<T extends Properties> {
  refs: ReferenceArgs<T>[];
}

export interface ReplaceArgs<T> {
  id: string;
  properties?: T;
  vector?: number[];
}

export interface UpdateArgs<T> extends ReplaceArgs<T> {}

export interface Data<T extends Properties> {
  delete: (id: string) => Promise<boolean>;
  deleteMany: (where: FilterValue, opts?: DeleteManyOptions) => Promise<BatchDeleteResult>;
  insert: (args: InsertArgs<T>) => Promise<string>;
  insertMany: (objects: (DataObject<T> | T)[]) => Promise<BatchObjectsReturn<T>>;
  referenceAdd: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  referenceAddMany: <P extends Properties>(args: ReferenceManyArgs<P>) => Promise<BatchReferencesReturn>;
  referenceDelete: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  referenceReplace: <P extends Properties>(args: ReferenceArgs<P>) => Promise<void>;
  replace: (args: ReplaceArgs<T>) => Promise<void>;
  update: (args: UpdateArgs<T>) => Promise<void>;
}

export type InsertObject<T> = InsertArgs<T>;

export type BatchDeleteResult = {
  failed: number;
  matches: number;
  objects?: Record<string, any>[];
  successful: number;
};

const data = <T extends Properties>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
): Data<T> => {
  const objectsPath = new ObjectsPath(dbVersionSupport);
  const referencesPath = new ReferencesPath(dbVersionSupport);

  const parseProperties = (properties: Record<string, any>, references?: ReferenceInputs<T>): T => {
    const parsedProperties: Properties = {};
    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      if (value !== null && value instanceof ReferenceManager) {
        parsedProperties[key] = value.toBeaconObjs();
      } else {
        parsedProperties[key] = value;
      }
    });
    if (!references) return parsedProperties as T;
    Object.keys(references).forEach((key) => {
      const value = references[key as keyof ReferenceInputs<T>];
      if (value !== null && value instanceof ReferenceManager) {
        parsedProperties[key] = value.toBeaconObjs();
      } else if (typeof value === 'string') {
        parsedProperties[key] = [uuidToBeacon(value)];
      } else if (Array.isArray(value)) {
        parsedProperties[key] = value.map((uuid) => uuidToBeacon(uuid));
      } else {
        parsedProperties[key] =
          typeof value.uuids === 'string'
            ? [uuidToBeacon(value.uuids, value.targetCollection)]
            : value.uuids.map((uuid) => uuidToBeacon(uuid, value.targetCollection));
      }
    });
    return parsedProperties as T;
  };

  const parseObject = (object: InsertObject<T>): WeaviateObject<T> => {
    return {
      id: object.id,
      properties: object.properties ? parseProperties(object.properties, object.references) : undefined,
      vector: object.vector,
    };
  };

  const parseDeleteMany = (where: FilterValue, opts?: DeleteManyOptions): any => {
    const parsed: any = {
      class: name,
      where: Serialize.filtersREST(where),
    };
    if (opts?.verbose) {
      parsed.verbose = 'verbose';
    }
    if (opts?.dryRun) {
      parsed.dryRun = true;
    }
    return { match: parsed };
  };

  return {
    delete: (id: string): Promise<boolean> =>
      objectsPath
        .buildDelete(id, name, consistencyLevel, tenant)
        .then((path) => connection.delete(path, undefined, false))
        .then(() => true),
    deleteMany: (where: FilterValue, opts?: DeleteManyOptions) => {
      const params = new URLSearchParams();
      if (consistencyLevel) {
        params.set('consistency_level', consistencyLevel);
      }
      if (tenant) {
        params.set('tenant', tenant);
      }
      const path = buildObjectsPath(params);
      return connection
        .delete(path, parseDeleteMany(where, opts), true)
        .then((res: BatchDeleteResponse) => res.results);
    },
    insert: (args: InsertArgs<T>): Promise<string> =>
      objectsPath
        .buildCreate(consistencyLevel)
        .then((path) =>
          connection.postReturn<WeaviateObject<T>, Required<WeaviateObject<T>>>(path, {
            class: name,
            tenant: tenant,
            ...parseObject(args),
          })
        )
        .then((obj) => obj.id),
    insertMany: (objects: (DataObject<T> | T)[]): Promise<BatchObjectsReturn<T>> =>
      connection.batch(consistencyLevel).then(async (batch) => {
        const serialized = await Serialize.batchObjects(name, objects, tenant);
        const start = Date.now();
        const reply = await batch.objects({ objects: serialized.mapped });
        const end = Date.now();
        return Deserialize.batchObjects<T>(reply, serialized.batch, serialized.mapped, end - start);
      }),
    referenceAdd: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) =>
          Promise.all(args.to.toBeaconObjs().map((beacon) => connection.postEmpty(path, beacon)))
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
        ref.to.toBeaconStrings().forEach((beaconStr) => {
          references.push({
            from: `weaviate://localhost/${name}/${ref.fromUuid}/${ref.fromProperty}`,
            to: beaconStr,
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
          Promise.all(args.to.toBeaconObjs().map((beacon) => connection.delete(path, beacon, false)))
        )
        .then(() => {})
        .catch((err) => {
          throw err;
        }),
    referenceReplace: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) => connection.put(path, args.to.toBeaconObjs(), false)),
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
