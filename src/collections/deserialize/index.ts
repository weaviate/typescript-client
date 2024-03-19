import { MetadataResult, PropertiesResult, SearchReply } from '../../proto/v1/search_get.js';
import { referenceFromObjects } from '../references/index.js';
import {
  BatchObjectsReturn,
  ReturnMetadata,
  Properties,
  GenerativeReturn,
  WeaviateReturn,
  GroupByObject,
  GroupByResult,
  GroupByReturn,
  ErrorObject,
  BatchObject,
  GenerativeGroupByReturn,
  GenerativeGroupByResult,
  DeleteManyReturn,
} from '../types/index.js';
import { BatchObject as BatchObjectGRPC, BatchObjectsReply } from '../../proto/v1/batch.js';
import { Properties as PropertiesGrpc, Value } from '../../proto/v1/properties.js';
import { BatchDeleteReply } from '../../proto/v1/batch_delete.js';

export default class Deserialize {
  public static query<T>(reply: SearchReply): WeaviateReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          metadata: Deserialize.metadata(result.metadata),
          properties: Deserialize.properties(result.properties),
          references: Deserialize.references(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vectors: Deserialize.vectors(result.metadata),
        } as any;
      }),
    };
  }

  public static generate<T>(reply: SearchReply): GenerativeReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          generated: result.metadata?.generativePresent ? result.metadata?.generative : undefined,
          metadata: Deserialize.metadata(result.metadata),
          properties: Deserialize.properties(result.properties),
          references: Deserialize.references(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vectors: Deserialize.vectors(result.metadata),
        } as any;
      }),
      generated: reply.generativeGroupedResult,
    };
  }

  public static groupBy<T>(reply: SearchReply): GroupByReturn<T> {
    const objects: GroupByObject<T>[] = [];
    const groups: Record<string, GroupByResult<T>> = {};
    reply.groupByResults.forEach((result) => {
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: Deserialize.properties(object.properties),
          references: Deserialize.references(object.properties),
          uuid: Deserialize.uuid(object.metadata),
          vectors: Deserialize.vectors(object.metadata),
        } as any;
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

  public static generateGroupBy<T>(reply: SearchReply): GenerativeGroupByReturn<T> {
    const objects: GroupByObject<T>[] = [];
    const groups: Record<string, GenerativeGroupByResult<T>> = {};
    reply.groupByResults.forEach((result) => {
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: Deserialize.properties(object.properties),
          references: Deserialize.references(object.properties),
          uuid: Deserialize.uuid(object.metadata),
          vectors: Deserialize.vectors(object.metadata),
        } as any;
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

  private static properties(properties?: PropertiesResult) {
    if (!properties) return {};
    return Deserialize.objectProperties(properties.nonRefProps);
  }

  private static references(properties?: PropertiesResult) {
    if (!properties) return undefined;
    if (properties.refProps.length === 0) return properties.refPropsRequested ? {} : undefined;
    const out: any = {};
    properties.refProps.forEach((property) => {
      const uuids: string[] = [];
      out[property.propName] = referenceFromObjects(
        property.properties.map((property) => {
          const uuid = Deserialize.uuid(property.metadata);
          uuids.push(uuid);
          return {
            metadata: Deserialize.metadata(property.metadata),
            properties: Deserialize.properties(property),
            references: Deserialize.references(property),
            uuid: uuid,
            vectors: Deserialize.vectors(property.metadata),
          };
        }),
        property.properties.length > 0 ? property.properties[0].targetCollection : '',
        uuids
      );
    });
    return out;
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

  private static metadata(metadata?: MetadataResult): ReturnMetadata | undefined {
    const out: ReturnMetadata = {};
    if (!metadata) return undefined;
    if (metadata.creationTimeUnixPresent) out.creationTime = new Date(metadata.creationTimeUnix);
    if (metadata.lastUpdateTimeUnixPresent) out.updateTime = new Date(metadata.lastUpdateTimeUnix);
    if (metadata.distancePresent) out.distance = metadata.distance;
    if (metadata.certaintyPresent) out.certainty = metadata.certainty;
    if (metadata.scorePresent) out.score = metadata.score;
    if (metadata.explainScorePresent) out.explainScore = metadata.explainScore;
    if (metadata.isConsistent) out.isConsistent = metadata.isConsistent;
    return out;
  }

  private static uuid(metadata?: MetadataResult) {
    if (!metadata || !(metadata.id.length > 0)) throw new Error('No uuid returned from server');
    return metadata.id;
  }

  private static vectorFromBytes(bytes: Uint8Array) {
    const buffer = Buffer.from(bytes);
    const view = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4); // vector is float32 in weaviate
    return Array.from(view);
  }

  private static vectors(metadata?: MetadataResult): Record<string, number[]> {
    if (!metadata) return {};
    if (metadata.vectorBytes.length === 0 && metadata.vector.length === 0 && metadata.vectors.length === 0)
      return {};
    if (metadata.vectorBytes.length > 0)
      return { default: Deserialize.vectorFromBytes(metadata.vectorBytes) };
    return Object.fromEntries(
      metadata.vectors.map((vector) => [vector.name, Deserialize.vectorFromBytes(vector.vectorBytes)])
    );
  }

  public static batchObjects<T>(
    reply: BatchObjectsReply,
    originalObjs: BatchObject<T>[],
    mappedObjs: BatchObjectGRPC[],
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
          originalUuid: object.id,
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
}
