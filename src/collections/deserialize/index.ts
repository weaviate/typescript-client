import { WeaviateDeserializationError } from '../../errors.js';
import { Tenant as TenantREST } from '../../openapi/types.js';
import {
  AggregateReply,
  AggregateReply_Aggregations,
  AggregateReply_Aggregations_Aggregation,
  AggregateReply_Aggregations_Aggregation_Boolean,
  AggregateReply_Aggregations_Aggregation_DateMessage,
  AggregateReply_Aggregations_Aggregation_Integer,
  AggregateReply_Aggregations_Aggregation_Number,
  AggregateReply_Aggregations_Aggregation_Text,
  AggregateReply_Group_GroupedBy,
} from '../../proto/v1/aggregate.js';
import { Vectors_VectorType } from '../../proto/v1/base.js';
import { BatchObject as BatchObjectGRPC, BatchObjectsReply } from '../../proto/v1/batch.js';
import { BatchDeleteReply } from '../../proto/v1/batch_delete.js';
import { ListValue, Properties as PropertiesGrpc, Value } from '../../proto/v1/properties.js';
import { MetadataResult, PropertiesResult, SearchReply } from '../../proto/v1/search_get.js';
import { TenantActivityStatus, TenantsGetReply } from '../../proto/v1/tenants.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { yieldToEventLoop } from '../../utils/yield.js';
import {
  AggregateBoolean,
  AggregateDate,
  AggregateGroupByResult,
  AggregateNumber,
  AggregateResult,
  AggregateText,
  AggregateType,
  PropertiesMetrics,
  Vectors,
  WeaviateObject,
} from '../index.js';
import { MultiVectorType, SingleVectorType } from '../query/types.js';
import { referenceFromObjects } from '../references/utils.js';
import { Tenant } from '../tenants/index.js';
import {
  BatchObject,
  BatchObjectsReturn,
  DeleteManyReturn,
  ErrorObject,
  GenerativeGroupByResult,
  GenerativeGroupByReturn,
  GenerativeReturn,
  GroupByObject,
  GroupByResult,
  GroupByReturn,
  Properties,
  ReturnMetadata,
  WeaviateReturn,
} from '../types/index.js';

const UINT16LEN = 2;
const UINT32LEN = 4;

export class Deserialize {
  private supports125ListValue: boolean;

  private constructor(supports125ListValue: boolean) {
    this.supports125ListValue = supports125ListValue;
  }

  public static async use(support: DbVersionSupport): Promise<Deserialize> {
    const supports125ListValue = await support.supports125ListValue().then((res) => res.supports);
    return new Deserialize(supports125ListValue);
  }

  private static aggregateBoolean(
    aggregation: AggregateReply_Aggregations_Aggregation_Boolean
  ): AggregateBoolean {
    return {
      count: aggregation.count,
      percentageFalse: aggregation.percentageFalse,
      percentageTrue: aggregation.percentageTrue,
      totalFalse: aggregation.totalFalse,
      totalTrue: aggregation.totalTrue,
    };
  }

  private static aggregateDate(
    aggregation: AggregateReply_Aggregations_Aggregation_DateMessage
  ): AggregateDate {
    const parse = (date: string | undefined) => (date !== undefined ? date : undefined);
    return {
      count: aggregation.count,
      maximum: parse(aggregation.maximum),
      median: parse(aggregation.median),
      minimum: parse(aggregation.minimum),
      mode: parse(aggregation.mode),
    };
  }

  private static aggregateInt(aggregation: AggregateReply_Aggregations_Aggregation_Integer): AggregateNumber {
    return {
      count: aggregation.count,
      maximum: aggregation.maximum,
      mean: aggregation.mean,
      median: aggregation.median,
      minimum: aggregation.minimum,
      mode: aggregation.mode,
      sum: aggregation.sum,
    };
  }

  private static aggregateNumber(
    aggregation: AggregateReply_Aggregations_Aggregation_Number
  ): AggregateNumber {
    return {
      count: aggregation.count,
      maximum: aggregation.maximum,
      mean: aggregation.mean,
      median: aggregation.median,
      minimum: aggregation.minimum,
      mode: aggregation.mode,
      sum: aggregation.sum,
    };
  }

  private static aggregateText(aggregation: AggregateReply_Aggregations_Aggregation_Text): AggregateText {
    return {
      count: aggregation.count,
      topOccurrences: aggregation.topOccurences?.items.map((occurrence) => {
        return {
          occurs: occurrence.occurs,
          value: occurrence.value,
        };
      }),
    };
  }

  private static mapAggregate(aggregation: AggregateReply_Aggregations_Aggregation): AggregateType {
    if (aggregation.boolean !== undefined) return Deserialize.aggregateBoolean(aggregation.boolean);
    if (aggregation.date !== undefined) return Deserialize.aggregateDate(aggregation.date);
    if (aggregation.int !== undefined) return Deserialize.aggregateInt(aggregation.int);
    if (aggregation.number !== undefined) return Deserialize.aggregateNumber(aggregation.number);
    // if (aggregation.reference !== undefined) return aggregation.reference;
    if (aggregation.text !== undefined) return Deserialize.aggregateText(aggregation.text);
    throw new WeaviateDeserializationError(`Unknown aggregation type: ${aggregation}`);
  }

  private static aggregations(aggregations?: AggregateReply_Aggregations): Record<string, AggregateType> {
    return aggregations
      ? Object.fromEntries(
          aggregations.aggregations.map((aggregation) => [
            aggregation.property,
            Deserialize.mapAggregate(aggregation),
          ])
        )
      : {};
  }

  public static aggregate<T, M extends PropertiesMetrics<T>>(reply: AggregateReply): AggregateResult<T, M> {
    if (reply.singleResult === undefined) {
      throw new WeaviateDeserializationError('No single result in aggregate response');
    }
    return {
      totalCount: reply.singleResult.objectsCount!,
      properties: Deserialize.aggregations(reply.singleResult.aggregations) as AggregateResult<
        T,
        M
      >['properties'],
    };
  }

  public static aggregateGroupBy<T, M extends PropertiesMetrics<T>>(
    reply: AggregateReply
  ): AggregateGroupByResult<T, M>[] {
    if (reply.groupedResults === undefined)
      throw new WeaviateDeserializationError('No grouped results in aggregate response');

    const parse = (groupedBy?: AggregateReply_Group_GroupedBy): AggregateGroupByResult<T, M>['groupedBy'] => {
      if (groupedBy === undefined)
        throw new WeaviateDeserializationError('No groupedBy in aggregate response');

      let value: AggregateGroupByResult<T, M>['groupedBy']['value'];
      if (groupedBy.boolean !== undefined) value = groupedBy.boolean;
      else if (groupedBy.booleans !== undefined) value = groupedBy.booleans.values;
      else if (groupedBy.geo !== undefined) value = groupedBy.geo;
      else if (groupedBy.int !== undefined) value = groupedBy.int;
      else if (groupedBy.ints !== undefined) value = groupedBy.ints.values;
      else if (groupedBy.number !== undefined) value = groupedBy.number;
      else if (groupedBy.numbers !== undefined) value = groupedBy.numbers.values;
      else if (groupedBy.text !== undefined) value = groupedBy.text;
      else if (groupedBy.texts !== undefined) value = groupedBy.texts.values;
      else {
        console.warn(`Unknown groupBy type: ${JSON.stringify(groupedBy, null, 2)}`);
        value = '';
      }

      return {
        prop: groupedBy.path[0],
        value,
      };
    };
    return reply.groupedResults.groups.map((group) => {
      return {
        totalCount: group.objectsCount!,
        groupedBy: parse(group.groupedBy),
        properties: Deserialize.aggregations(group.aggregations) as AggregateResult<T, M>['properties'],
      };
    });
  }

  public async query<T, V>(reply: SearchReply): Promise<WeaviateReturn<T, V>> {
    return {
      objects: await Promise.all(
        reply.results.map(async (result) => {
          return {
            metadata: Deserialize.metadata(result.metadata),
            properties: this.properties(result.properties),
            references: await this.references(result.properties),
            uuid: Deserialize.uuid(result.metadata),
            vectors: await Deserialize.vectors(result.metadata),
          } as unknown as WeaviateObject<T, V>;
        })
      ),
    };
  }

  public async generate<T, V>(reply: SearchReply): Promise<GenerativeReturn<T, V>> {
    return {
      objects: await Promise.all(
        reply.results.map(async (result) => {
          return {
            generated: result.metadata?.generativePresent ? result.metadata?.generative : undefined,
            metadata: Deserialize.metadata(result.metadata),
            properties: this.properties(result.properties),
            references: await this.references(result.properties),
            uuid: Deserialize.uuid(result.metadata),
            vectors: await Deserialize.vectors(result.metadata),
          } as unknown as WeaviateObject<T, V>;
        })
      ),
      generated: reply.generativeGroupedResult,
    };
  }

  public async queryGroupBy<T, V>(reply: SearchReply): Promise<GroupByReturn<T, V>> {
    const objects: GroupByObject<T, V>[] = [];
    const groups: Record<string, GroupByResult<T, V>> = {};
    for (const result of reply.groupByResults) {
      // eslint-disable-next-line no-await-in-loop
      const objs = await Promise.all(
        result.objects.map(async (object) => {
          return {
            belongsToGroup: result.name,
            metadata: Deserialize.metadata(object.metadata),
            properties: this.properties(object.properties),
            references: await this.references(object.properties),
            uuid: Deserialize.uuid(object.metadata),
            vectors: await Deserialize.vectors(object.metadata),
          } as unknown as GroupByObject<T, V>;
        })
      );
      groups[result.name] = {
        maxDistance: result.maxDistance,
        minDistance: result.minDistance,
        name: result.name,
        numberOfObjects: result.numberOfObjects,
        objects: objs,
      };
      objects.push(...objs);
    }
    return {
      objects: objects,
      groups: groups,
    };
  }

  public async generateGroupBy<T, V>(reply: SearchReply): Promise<GenerativeGroupByReturn<T, V>> {
    const objects: GroupByObject<T, V>[] = [];
    const groups: Record<string, GenerativeGroupByResult<T, V>> = {};
    for (const result of reply.groupByResults) {
      // eslint-disable-next-line no-await-in-loop
      const objs = await Promise.all(
        result.objects.map(async (object) => {
          return {
            belongsToGroup: result.name,
            metadata: Deserialize.metadata(object.metadata),
            properties: this.properties(object.properties),
            references: await this.references(object.properties),
            uuid: Deserialize.uuid(object.metadata),
            vectors: await Deserialize.vectors(object.metadata),
          } as unknown as GroupByObject<T, V>;
        })
      );
      groups[result.name] = {
        maxDistance: result.maxDistance,
        minDistance: result.minDistance,
        name: result.name,
        numberOfObjects: result.numberOfObjects,
        objects: objs,
        generated: result.generative?.result,
      };
      objects.push(...objs);
    }
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

  private async references(properties?: PropertiesResult) {
    if (!properties) return undefined;
    if (properties.refProps.length === 0) return properties.refPropsRequested ? {} : undefined;
    const out: any = {};
    for (const property of properties.refProps) {
      const uuids: string[] = [];
      out[property.propName] = referenceFromObjects(
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          property.properties.map(async (property) => {
            const uuid = Deserialize.uuid(property.metadata);
            uuids.push(uuid);
            return {
              metadata: Deserialize.metadata(property.metadata),
              properties: this.properties(property),
              references: await this.references(property),
              uuid: uuid,
              vectors: await Deserialize.vectors(property.metadata),
            };
          })
        ),
        property.properties.length > 0 ? property.properties[0].targetCollection : '',
        uuids
      );
    }
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

  /**
   * Convert an Uint8Array into a 2D vector array.
   *
   * Defined as an async method so that control can be relinquished back to the event loop on each outer loop for large vectors.
   */
  private static vectorsFromBytes(bytes: Uint8Array): Promise<MultiVectorType> {
    const dimOffset = UINT16LEN;
    const dimBytes = Buffer.from(bytes.slice(0, dimOffset));
    const vectorDimension = dimBytes.readUInt16LE(0);

    const vecByteLength = UINT32LEN * vectorDimension;
    const howMany = (bytes.byteLength - dimOffset) / vecByteLength;

    return Promise.all(
      Array(howMany)
        .fill(0)
        .map((_, i) =>
          yieldToEventLoop().then(() =>
            Deserialize.vectorFromBytes(
              bytes.slice(dimOffset + i * vecByteLength, dimOffset + (i + 1) * vecByteLength)
            )
          )
        )
    );
  }

  private static vectorFromBytes(bytes: Uint8Array): SingleVectorType {
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

  private static async vectors(metadata?: MetadataResult): Promise<Vectors> {
    if (!metadata) return {};
    if (metadata.vectorBytes.length === 0 && metadata.vector.length === 0 && metadata.vectors.length === 0)
      return {};
    if (metadata.vectorBytes.length > 0)
      return { default: Deserialize.vectorFromBytes(metadata.vectorBytes) };
    return Object.fromEntries(
      await Promise.all(
        metadata.vectors.map(async (vector) => [
          vector.name,
          vector.type === Vectors_VectorType.VECTOR_TYPE_MULTI_FP32
            ? await Deserialize.vectorsFromBytes(vector.vectorBytes)
            : Deserialize.vectorFromBytes(vector.vectorBytes),
        ])
      )
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

  private static activityStatusGRPC(status: TenantActivityStatus): Tenant['activityStatus'] {
    switch (status) {
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_COLD:
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_INACTIVE:
        return 'INACTIVE';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_HOT:
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_ACTIVE:
        return 'ACTIVE';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_FROZEN:
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_OFFLOADED:
        return 'OFFLOADED';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_FREEZING:
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_OFFLOADING:
        return 'OFFLOADING';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_UNFREEZING:
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_ONLOADING:
        return 'ONLOADING';
      default:
        throw new Error(`Unsupported tenant activity status: ${status}`);
    }
  }

  public static activityStatusREST(status: TenantREST['activityStatus']): Tenant['activityStatus'] {
    switch (status) {
      case 'COLD':
        return 'INACTIVE';
      case 'HOT':
        return 'ACTIVE';
      case 'FROZEN':
        return 'OFFLOADED';
      case 'FREEZING':
        return 'OFFLOADING';
      case 'UNFREEZING':
        return 'ONLOADING';
      case undefined:
        return 'ACTIVE';
      default:
        return status;
    }
  }

  public static tenantsGet(reply: TenantsGetReply) {
    const tenants: Record<string, Tenant> = {};
    reply.tenants.forEach((t) => {
      tenants[t.name] = {
        name: t.name,
        activityStatus: Deserialize.activityStatusGRPC(t.activityStatus),
      };
    });
    return tenants;
  }
}
