import { MetadataResult, PropertiesResult, SearchReply } from '../../proto/v1/search_get.js';
import { referenceFromObjects } from '../references/utils.js';
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
import { ListValue, Properties as PropertiesGrpc, Value } from '../../proto/v1/properties.js';
import { BatchDeleteReply } from '../../proto/v1/batch_delete.js';
import { WeaviateDeserializationError } from '../../errors.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

export class Deserialize {
  private supports125ListValue: boolean;

  private constructor(supports125ListValue: boolean) {
    this.supports125ListValue = supports125ListValue;
  }

  public static async use(support: DbVersionSupport): Promise<Deserialize> {
    const supports125ListValue = await support.supports125ListValue().then((res) => res.supports);
    return new Deserialize(supports125ListValue);
  }

  public query<T>(reply: SearchReply): WeaviateReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          metadata: Deserialize.metadata(result.metadata),
          properties: this.properties(result.properties),
          references: this.references(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vectors: Deserialize.vectors(result.metadata),
        } as any;
      }),
    };
  }

  public generate<T>(reply: SearchReply): GenerativeReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          generated: result.metadata?.generativePresent ? result.metadata?.generative : undefined,
          metadata: Deserialize.metadata(result.metadata),
          properties: this.properties(result.properties),
          references: this.references(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vectors: Deserialize.vectors(result.metadata),
        } as any;
      }),
      generated: reply.generativeGroupedResult,
    };
  }

  public groupBy<T>(reply: SearchReply): GroupByReturn<T> {
    const objects: GroupByObject<T>[] = [];
    const groups: Record<string, GroupByResult<T>> = {};
    reply.groupByResults.forEach((result) => {
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: this.properties(object.properties),
          references: this.references(object.properties),
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

  public generateGroupBy<T>(reply: SearchReply): GenerativeGroupByReturn<T> {
    const objects: GroupByObject<T>[] = [];
    const groups: Record<string, GenerativeGroupByResult<T>> = {};
    reply.groupByResults.forEach((result) => {
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: this.properties(object.properties),
          references: this.references(object.properties),
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

  private properties(properties?: PropertiesResult) {
    if (!properties) return {};
    return this.objectProperties(properties.nonRefProps);
  }

  private references(properties?: PropertiesResult) {
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
            properties: this.properties(property),
            references: this.references(property),
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

  private parsePropertyValue(value: Value): any {
    if (value.boolValue !== undefined) return value.boolValue;
    if (value.dateValue !== undefined) return new Date(value.dateValue);
    if (value.intValue !== undefined) return value.intValue;
    if (value.listValue !== undefined)
      return this.supports125ListValue
        ? this.parseListValue(value.listValue)
        : value.listValue.values.map((v) => this.parsePropertyValue(v));
    if (value.numberValue !== undefined) return value.numberValue;
    if (value.objectValue !== undefined) return this.objectProperties(value.objectValue);
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.textValue !== undefined) return value.textValue;
    if (value.uuidValue !== undefined) return value.uuidValue;
    if (value.blobValue !== undefined) return value.blobValue;
    if (value.geoValue !== undefined) return value.geoValue;
    if (value.phoneValue !== undefined) return value.phoneValue;
    if (value.nullValue !== undefined) return undefined;
    throw new WeaviateDeserializationError(`Unknown value type: ${JSON.stringify(value, null, 2)}`);
  }

  private parseListValue(value: ListValue): string[] | number[] | boolean[] | Date[] | Properties[] {
    if (value.boolValues !== undefined) return value.boolValues.values;
    if (value.dateValues !== undefined) return value.dateValues.values.map((date) => new Date(date));
    if (value.intValues !== undefined) return Deserialize.intsFromBytes(value.intValues.values);
    if (value.numberValues !== undefined) return Deserialize.numbersFromBytes(value.numberValues.values);
    if (value.objectValues !== undefined)
      return value.objectValues.values.map((v) => this.objectProperties(v));
    if (value.textValues !== undefined) return value.textValues.values;
    if (value.uuidValues !== undefined) return value.uuidValues.values;
    throw new Error(`Unknown list value type: ${JSON.stringify(value, null, 2)}`);
  }

  private objectProperties(properties?: PropertiesGrpc): Properties {
    const out: Properties = {};
    if (properties) {
      Object.entries(properties.fields).forEach(([key, value]) => {
        out[key] = this.parsePropertyValue(value);
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
    if (metadata.rerankScorePresent) out.rerankScore = metadata.rerankScore;
    if (metadata.isConsistent) out.isConsistent = metadata.isConsistent;
    return out;
  }

  private static uuid(metadata?: MetadataResult) {
    if (!metadata || !(metadata.id.length > 0))
      throw new WeaviateDeserializationError('No uuid returned from server');
    return metadata.id;
  }

  private static vectorFromBytes(bytes: Uint8Array) {
    const buffer = Buffer.from(bytes);
    const view = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4); // vector is float32 in weaviate
    return Array.from(view);
  }

  private static intsFromBytes(bytes: Uint8Array) {
    const buffer = Buffer.from(bytes);
    const view = new BigInt64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 8); // ints are float64 in weaviate
    return Array.from(view).map(Number);
  }

  private static numbersFromBytes(bytes: Uint8Array) {
    const buffer = Buffer.from(bytes);
    const view = new Float64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 8); // numbers are float64 in weaviate
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
