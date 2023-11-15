import Connection from '../connection';

import {
  WeaviateObject,
  BatchDeleteResponse,
  BatchReference,
  BatchReferenceResponse,
} from '../openapi/types';
import { buildRefsPath } from '../batch/path';
import { ObjectsPath, ReferencesPath } from '../data/path';
import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';
import { ReferenceManager } from './references';
import Serialize from './serialize';
import { BatchObjectsReturn, BatchReferencesReturn, DataObject, ErrorReference, Properties } from './types';
import { Filters, FilterValueType } from './filters';
import Deserialize from './deserialize';

export interface DeleteArgs {
  id: string;
}

export interface DeleteManyArgs {
  where: Filters<FilterValueType>;
  verbose?: boolean;
  dryRun?: boolean;
}

export interface InsertArgs<T> {
  id?: string;
  properties?: T;
  vector?: number[];
}

export interface ReferenceArgs<T extends Properties> {
  fromUuid: string;
  fromProperty: string;
  reference: ReferenceManager<T>;
}

export interface ReferenceManyArgs<T extends Properties> {
  refs: ReferenceArgs<T>[];
}

export interface ReplaceArgs<T> {
  id: string;
  properties?: T;
  vector?: number[];
}

export interface InsertManyArgs<T extends Properties> {
  objects: DataObject<T>[];
}

export interface UpdateArgs<T> extends ReplaceArgs<T> {}

export interface Data<T extends Properties> {
  delete: (args: DeleteArgs) => Promise<boolean>;
  deleteMany: (args: DeleteManyArgs) => Promise<BatchDeleteResult>;
  insert: (args: InsertArgs<T>) => Promise<string>;
  insertMany: (args: InsertManyArgs<T>) => Promise<BatchObjectsReturn<T>>;
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

  const parseProperties = (properties: T): T => {
    const parsedProperties: Properties = {};
    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      if (value !== null && value instanceof ReferenceManager) {
        parsedProperties[key] = value.toBeaconObjs();
      } else {
        parsedProperties[key] = value;
      }
    });
    return parsedProperties as T;
  };

  const parseObject = (object: InsertObject<T>): WeaviateObject<T> => {
    return {
      id: object.id,
      properties: object.properties ? parseProperties(object.properties) : undefined,
      vector: object.vector,
    };
  };

  const parseDeleteMany = (args: DeleteManyArgs): any => {
    const parsed: any = {
      class: name,
      where: Serialize.filtersREST(args.where),
    };
    if (args.verbose) {
      parsed.verbose = 'verbose';
    }
    if (args.dryRun) {
      parsed.dryRun = true;
    }
    return { match: parsed };
  };

  return {
    delete: (args: DeleteArgs): Promise<boolean> =>
      objectsPath
        .buildDelete(args.id, name, consistencyLevel)
        .then((path) => connection.delete(path, undefined, false))
        .then(() => true),
    deleteMany: (args: DeleteManyArgs) =>
      connection
        .delete(`/batch/objects`, parseDeleteMany(args), true)
        .then((res: BatchDeleteResponse) => res.results),
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
    insertMany: (args: InsertManyArgs<T>): Promise<BatchObjectsReturn<T>> =>
      connection.batch(consistencyLevel).then(async (batch) => {
        const serialized = await Serialize.batchObjects(name, args.objects, tenant);
        const start = Date.now();
        const reply = await batch.objects({ objects: serialized.mapped });
        const end = Date.now();
        return Deserialize.batchObjects<T>(reply, serialized.batch, serialized.mapped, start - end);
      }),
    referenceAdd: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) =>
          Promise.all(args.reference.toBeaconObjs().map((beacon) => connection.postEmpty(path, beacon)))
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
        ref.reference.toBeaconStrings().forEach((beaconStr) => {
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
          Promise.all(args.reference.toBeaconObjs().map((beacon) => connection.delete(path, beacon, false)))
        )
        .then(() => {})
        .catch((err) => {
          throw err;
        }),
    referenceReplace: <P extends Properties>(args: ReferenceArgs<P>): Promise<void> =>
      referencesPath
        .build(args.fromUuid, name, args.fromProperty, consistencyLevel, tenant)
        .then((path) => connection.put(path, args.reference.toBeaconObjs(), false)),
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
