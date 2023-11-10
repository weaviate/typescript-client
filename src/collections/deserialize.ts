import { v4 as uuidv4 } from 'uuid';
import { Metadata } from 'nice-grpc';
import { MetadataResult, PropertiesResult, SearchReply } from '../proto/v1/search_get';
import { referenceFromObjects } from './references';
import {
  BatchObjectsReturn,
  DataObject,
  MetadataReturn,
  Properties,
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

export interface PropertiesGrpc {
  nonRefProperties?: {
    [key: string]: any;
  };
  textArrayProperties: {
    propName: string;
    values: string[];
  }[];
  intArrayProperties: {
    propName: string;
    values: number[];
  }[];
  numberArrayProperties: {
    propName: string;
    values: number[];
  }[];
  booleanArrayProperties: {
    propName: string;
    values: boolean[];
  }[];
  objectProperties: {
    propName: string;
    value?: PropertiesGrpc;
  }[];
  objectArrayProperties: {
    propName: string;
    values: PropertiesGrpc[];
  }[];
}

export default class Deserialize {
  public static query<T extends Properties>(reply: SearchReply): QueryReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          properties: result.properties ? Deserialize.properties<T>(result.properties) : ({} as T),
          metadata: result.metadata ? Deserialize.metadata(result.metadata) : {},
        };
      }),
    };
  }

  public static generate<T extends Properties>(reply: SearchReply): GenerateReturn<T> {
    return {
      objects: reply.results.map((result) => {
        return {
          properties: result.properties ? Deserialize.properties<T>(result.properties) : ({} as T),
          metadata: result.metadata ? Deserialize.metadata(result.metadata) : {},
          generated: result.metadata?.generativePresent ? result.metadata?.generative : undefined,
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
          properties: object.properties ? Deserialize.properties<T>(object.properties) : ({} as T),
          metadata: object.metadata ? Deserialize.metadata(object.metadata) : {},
          belongsToGroup: result.name,
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

  private static properties<T extends Properties>(properties: PropertiesResult): T {
    const out = Deserialize.objectProperties(properties);
    properties.refProps.forEach((property) => {
      out[property.propName] = referenceFromObjects(
        property.properties.map((property) => {
          return {
            properties: Deserialize.properties(property),
            metadata: property.metadata ? Deserialize.metadata(property.metadata) : {},
          };
        })
      );
    });
    return out as T;
  }

  private static objectProperties(properties: PropertiesGrpc): Properties {
    const out: Properties = {};
    if (properties.nonRefProperties) {
      Object.entries(properties.nonRefProperties).forEach(([key, value]) => {
        out[key] = value;
      });
    }
    properties.textArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.intArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.numberArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.booleanArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.objectProperties.forEach((property) => {
      if (!property.value) return;
      out[property.propName] = Deserialize.objectProperties(property.value);
    });
    properties.objectArrayProperties.forEach((property) => {
      out[property.propName] = property.values.map((value) => Deserialize.objectProperties(value));
    });
    return out;
  }

  private static metadata(metadata: MetadataResult): MetadataReturn {
    const out: MetadataReturn = {};
    if (metadata.id.length > 0) out.uuid = metadata.id;
    if (metadata.vector.length > 0) out.vector = metadata.vector;
    if (metadata.creationTimeUnixPresent) out.creationTimeUnix = metadata.creationTimeUnix;
    if (metadata.lastUpdateTimeUnixPresent) out.lastUpdateTimeUnix = metadata.lastUpdateTimeUnix;
    if (metadata.distancePresent) out.distance = metadata.distance;
    if (metadata.certaintyPresent) out.certainty = metadata.certainty;
    if (metadata.scorePresent) out.score = metadata.score;
    if (metadata.explainScorePresent) out.explainScore = metadata.explainScore;
    if (metadata.isConsistent) out.isConsistent = metadata.isConsistent;
    return out;
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
}
