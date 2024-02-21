import { MetadataResult, PropertiesResult, SearchReply } from '../proto/v1/search_get';
import { referenceFromObjects } from './references';
import {
  BatchObjectsReturn,
  MetadataReturn,
  Properties,
  GenerativeReturn,
  WeaviateReturn,
  GroupByObject,
  GroupByResult,
  GroupByReturn,
  ErrorObject,
  BatchObject,
  ReturnProperties,
  ReturnReferences,
  GenerativeGroupByReturn,
  GenerativeGroupByResult,
  DeleteManyReturn,
} from './types';
import { BatchObject as BatchObjectGrpc, BatchObjectsReply } from '../proto/v1/batch';
import { Properties as PropertiesGrpc, Value } from '../proto/v1/properties';
import { BatchDeleteReply } from '../proto/v1/batch_delete';

export default class Deserialize {
  public static query<T extends Properties>(reply: SearchReply): WeaviateReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          metadata: Deserialize.metadata(result.metadata),
          properties: Deserialize.properties<T>(result.properties),
          references: Deserialize.references<T>(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vector: Deserialize.vector(result.metadata),
        };
      }),
    };
  }

  public static generate<T extends Properties>(reply: SearchReply): GenerativeReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          generated: result.metadata?.generativePresent ? result.metadata?.generative : undefined,
          metadata: Deserialize.metadata(result.metadata),
          properties: Deserialize.properties<T>(result.properties),
          references: Deserialize.references<T>(result.properties),
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
          references: Deserialize.references<T>(object.properties),
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

  public static generateGroupBy<T extends Properties>(reply: SearchReply): GenerativeGroupByReturn<T> {
    const objects: GroupByObject<T>[] = [];
    const groups: Record<string, GenerativeGroupByResult<T>> = {};
    reply.groupByResults.forEach((result) => {
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: Deserialize.properties<T>(object.properties),
          references: Deserialize.references<T>(object.properties),
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
        generated: result.generative?.result,
      };
      objects.push(...objs);
    });
    return {
      objects: objects,
      groups: groups,
      generated: reply.generativeGroupedResult,
    };
  }

  private static properties<T extends Properties>(properties?: PropertiesResult): ReturnProperties<T> {
    if (!properties) return {} as ReturnProperties<T>;
    return Deserialize.objectProperties(properties.nonRefProps) as ReturnProperties<T>;
  }

  private static references<T extends Properties>(
    properties?: PropertiesResult
  ): ReturnReferences<T> | undefined {
    if (!properties) return undefined;
    if (properties.refProps.length === 0) return undefined;
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
    return out as ReturnReferences<T>;
  }

  private static parsePropertyValue(value: Value): any {
    if (value.boolValue !== undefined) return value.boolValue;
    if (value.dateValue !== undefined) return new Date(value.dateValue);
    if (value.intValue !== undefined) return value.intValue;
    if (value.listValue !== undefined)
      return value.listValue.values.map((v) => Deserialize.parsePropertyValue(v));
    if (value.numberValue !== undefined) return value.numberValue;
    if (value.objectValue !== undefined) return Deserialize.objectProperties(value.objectValue);
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.uuidValue !== undefined) return value.uuidValue;
    if (value.blobValue !== undefined) return value.blobValue;
    if (value.geoValue !== undefined) return value.geoValue;
    if (value.phoneValue !== undefined) return value.phoneValue;
    if (value.nullValue !== undefined) return undefined;
    throw new Error(`Unknown value type: ${JSON.stringify(value, null, 2)}`);
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
    if (metadata.creationTimeUnixPresent) out.creationTime = metadata.creationTimeUnix;
    if (metadata.lastUpdateTimeUnixPresent) out.updateTime = metadata.lastUpdateTimeUnix;
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

  private static vectorFromBytes(bytes: Uint8Array): number[] {
    const buffer = Buffer.from(bytes);
    const view = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4); // vector is float32 in weaviate
    return Array.from(view);
  }

  private static vector(metadata?: MetadataResult): Record<string, number[]> {
    if (!metadata) return {};
    if (metadata.vectorBytes.length === 0 && metadata.vector.length === 0 && metadata.vectors.length === 0)
      return {};
    if (metadata.vectorBytes.length > 0)
      return { default: Deserialize.vectorFromBytes(metadata.vectorBytes) };
    return Object.fromEntries(
      metadata.vectors.map((vector) => [vector.name, Deserialize.vectorFromBytes(vector.vectorBytes)])
    );
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

  public static deleteMany<V extends boolean>(reply: BatchDeleteReply, verbose?: V): DeleteManyReturn<V> {
    return {
      ...reply,
      objects: verbose
        ? reply.objects.map((obj) => {
            return {
              id: obj.uuid.toString(),
              successful: obj.successful,
              error: obj.error,
            };
          })
        : (undefined as any),
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
        // out[key] =
        //   value.length > 0 ? ReferenceManager.fromBeaconStrings(value.map((v) => v.beacon)) : null;
        out[key] = null;
      } else {
        out[key] = value;
      }
    });
    return out as T;
  }
}
