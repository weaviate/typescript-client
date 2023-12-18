import { v4 as uuidv4 } from 'uuid';
import { Metadata } from 'nice-grpc';
import { MetadataResult, PropertiesResult, SearchReply } from '../proto/v1/search_get';
import { ReferenceManager, referenceFromObjects } from './references';
import {
  BatchObjectsReturn,
  DataObject,
  MetadataReturn,
  Properties,
  References,
  GenerateReturn,
  QueryReturn,
  GroupByObject,
  GroupByResult,
  GroupByReturn,
  ErrorObject,
  BatchObject,
} from './types';
import {
  BatchObject as BatchObjectGrpc,
  BatchObjectsReply,
  BatchObjectsReply_BatchError,
} from '../proto/v1/batch';
import { Properties as PropertiesGrpc, Value } from '../proto/v1/properties';

// export interface PropertiesGrpc {
//   nonRefProperties?: {
//     [key: string]: any;
//   };
//   textArrayProperties: {
//     propName: string;
//     values: string[];
//   }[];
//   intArrayProperties: {
//     propName: string;
//     values: number[];
//   }[];
//   numberArrayProperties: {
//     propName: string;
//     values: number[];
//   }[];
//   booleanArrayProperties: {
//     propName: string;
//     values: boolean[];
//   }[];
//   objectProperties: {
//     propName: string;
//     value?: PropertiesGrpc;
//   }[];
//   objectArrayProperties: {
//     propName: string;
//     values: PropertiesGrpc[];
//   }[];
// }

export default class Deserialize {
  public static query<T extends Properties, U extends References>(reply: SearchReply): QueryReturn<T, U> {
    return {
      objects: reply.results.map((result) => {
        return {
          metadata: Deserialize.metadata(result.metadata),
          properties: Deserialize.properties<T>(result.properties),
          references: Deserialize.references<U>(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vector: Deserialize.vector(result.metadata),
        };
      }),
    };
  }

  public static generate<T extends Properties>(reply: SearchReply): GenerateReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          generated: result.metadata?.generativePresent ? result.metadata?.generative : undefined,
          metadata: Deserialize.metadata(result.metadata),
          properties: Deserialize.properties<T>(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vector: Deserialize.vector(result.metadata),
        };
      }),
      generated: reply.generativeGroupedResult,
    };
  }

  public static groupBy<T extends Properties>(reply: SearchReply): GroupByReturn<T> {
    const objects: GroupByObject<T>[] = [];
    const groups: Record<string, GroupByResult<T>> = {};
    reply.groupByResults.forEach((result) => {
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: Deserialize.properties<T>(object.properties),
          uuid: Deserialize.uuid(object.metadata),
          vector: Deserialize.vector(object.metadata),
        };
      });
      groups[result.name] = {
        maxDistance: result.maxDistance,
        minDistance: result.minDistance,
        name: result.name,
        numberOfObjects: result.numberOfObjects,
        objects: objs,
      };
      objects.push(...objs);
    });
    return {
      objects: objects,
      groups: groups,
    };
  }

  private static properties<T extends Properties>(properties?: PropertiesResult): T {
    if (!properties) return {} as T;
    return Deserialize.objectProperties(properties.nonRefProps) as T;
  }

  private static references<U extends References>(properties?: PropertiesResult): U {
    if (!properties) return {} as U;
    const out: any = {};
    properties.refProps.forEach((property) => {
      out[property.propName] = referenceFromObjects(
        property.properties.map((property) => {
          return {
            metadata: Deserialize.metadata(property.metadata),
            properties: Deserialize.properties(property),
            references: Deserialize.references(property),
            uuid: Deserialize.uuid(property.metadata),
            vector: Deserialize.vector(property.metadata),
          };
        })
      );
    });
    return out as U;
  }

  private static parsePropertyValue(value: Value): any {
    if (value.boolValue) return value.boolValue;
    if (value.dateValue) return new Date(value.dateValue);
    if (value.geoValue) return value.geoValue;
    if (value.intValue) return value.intValue;
    if (value.listValue) return value.listValue.values.map((v) => Deserialize.parsePropertyValue(v));
    if (value.numberValue) return value.numberValue;
    if (value.objectValue) return Deserialize.objectProperties(value.objectValue);
    if (value.stringValue) return value.stringValue;
    if (value.uuidValue) return value.uuidValue;
  }

  private static objectProperties(properties?: PropertiesGrpc): Properties {
    const out: Properties = {};
    if (properties) {
      Object.entries(properties.fields).forEach(([key, value]) => {
        out[key] = Deserialize.parsePropertyValue(value);
      });
    }
    return out;
  }

  private static metadata(metadata?: MetadataResult): MetadataReturn | undefined {
    const out: MetadataReturn = {};
    if (!metadata) return undefined;
    if (metadata.creationTimeUnixPresent) out.creationTimeUnix = metadata.creationTimeUnix;
    if (metadata.lastUpdateTimeUnixPresent) out.lastUpdateTimeUnix = metadata.lastUpdateTimeUnix;
    if (metadata.distancePresent) out.distance = metadata.distance;
    if (metadata.certaintyPresent) out.certainty = metadata.certainty;
    if (metadata.scorePresent) out.score = metadata.score;
    if (metadata.explainScorePresent) out.explainScore = metadata.explainScore;
    if (metadata.isConsistent) out.isConsistent = metadata.isConsistent;
    return out;
  }

  private static uuid(metadata?: MetadataResult): string {
    if (!metadata || !(metadata.id.length > 0)) throw new Error('No uuid returned from server');
    return metadata.id;
  }

  private static vector(metadata?: MetadataResult): number[] | undefined {
    if (!metadata) return undefined;
    if (metadata.vector.length > 0) return metadata.vector;
  }

  public static batchObjects<T extends Properties>(
    reply: BatchObjectsReply,
    originalObjs: BatchObject<T>[],
    mappedObjs: BatchObjectGrpc[],
    elapsed: number
  ): BatchObjectsReturn<T> {
    const allResponses = [];
    const errors: Record<number, ErrorObject<T>> = {};
    const successes: Record<number, string> = {};

    const batchErrors: Record<number, string> = {};
    reply.errors.forEach((error) => {
      batchErrors[error.index] = error.error;
    });

    for (const [index, object] of originalObjs.entries()) {
      if (index in batchErrors) {
        const error: ErrorObject<T> = {
          message: batchErrors[index],
          object: object,
          originalUuid: object.uuid,
        };
        errors[index] = error;
        allResponses[index] = error;
      } else {
        const mappedObj = mappedObjs[index];
        successes[index] = mappedObj.uuid;
        allResponses[index] = mappedObj.uuid;
      }
    }

    return {
      uuids: successes,
      errors: errors,
      hasErrors: reply.errors.length > 0,
      allResponses: allResponses,
      elapsedSeconds: elapsed,
    };
  }

  public static propertiesREST<T extends Properties>(properties: Record<string, any>): T {
    const isRefProp = (value: any): value is Array<{ beacon: string; href: string }> => {
      return (
        Array.isArray(value) &&
        value.every((v) => Object.keys(v).every((k) => k === 'beacon' || k === 'href'))
      );
    };
    const out: Properties = {};
    Object.entries(properties).forEach(([key, value]) => {
      if (isRefProp(value)) {
        out[key] =
          value.length > 0 ? ReferenceManager.fromBeaconStrings(value.map((v) => v.beacon)) : undefined;
      } else {
        out[key] = value;
      }
    });
    return out as T;
  }
}
