import {
  SearchBm25Args,
  SearchFetchArgs,
  SearchHybridArgs,
  SearchNearAudioArgs,
  SearchNearDepthArgs,
  SearchNearIMUArgs,
  SearchNearImageArgs,
  SearchNearObjectArgs,
  SearchNearTextArgs,
  SearchNearThermalArgs,
  SearchNearVectorArgs,
  SearchNearVideoArgs,
} from '../../grpc/searcher.js';
import { WhereFilter } from '../../openapi/types.js';
import { Filters as FiltersGRPC } from '../../proto/v1/base.js';
import { GenerativeSearch } from '../../proto/v1/generative.js';
import { GroupBy, Rerank, Targets } from '../../proto/v1/search_get.js';
import { FilterValue } from '../filters/index.js';
import {
  BaseNearOptions,
  Bm25Options,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  HybridNearTextSubSearch,
  HybridNearVectorSubSearch,
  HybridOptions,
  NearOptions,
  NearTextOptions,
  NearVectorInputType,
  TargetVectorInputType,
} from '../query/types.js';
import { TenantBC, TenantCreate, TenantUpdate } from '../tenants/types.js';
import {
  BatchObjects,
  DataObject,
  GenerateOptions,
  GroupByOptions,
  MetadataKeys,
  NestedProperties,
  NonReferenceInputs,
  PhoneNumberInput,
  QueryMetadata,
  ReferenceInput,
  RerankOptions,
  WeaviateField,
} from '../types/index.js';
export declare class DataGuards {
  static isText: (argument?: WeaviateField) => argument is string;
  static isTextArray: (argument?: WeaviateField) => argument is string[];
  static isInt: (argument?: WeaviateField) => argument is number;
  static isIntArray: (argument?: WeaviateField) => argument is number[];
  static isFloat: (argument?: WeaviateField) => argument is number;
  static isFloatArray: (argument?: WeaviateField) => argument is number[];
  static isBoolean: (argument?: WeaviateField) => argument is boolean;
  static isBooleanArray: (argument?: WeaviateField) => argument is boolean[];
  static isDate: (argument?: WeaviateField) => argument is Date;
  static isDateArray: (argument?: WeaviateField) => argument is Date[];
  static isGeoCoordinate: (
    argument?: WeaviateField
  ) => argument is Required<import('../../proto/v1/properties.js').GeoCoordinate>;
  static isPhoneNumber: (argument?: WeaviateField) => argument is PhoneNumberInput;
  static isNested: (argument?: WeaviateField) => argument is NestedProperties;
  static isNestedArray: (argument?: WeaviateField) => argument is NestedProperties[];
  static isEmptyArray: (argument?: WeaviateField) => argument is [];
  static isDataObject: <T>(obj: DataObject<T> | NonReferenceInputs<T>) => obj is DataObject<T>;
}
export declare class MetadataGuards {
  static isKeys: (argument?: QueryMetadata) => argument is MetadataKeys;
  static isAll: (argument?: QueryMetadata) => argument is 'all';
  static isUndefined: (argument?: QueryMetadata) => argument is undefined;
}
export declare class Serialize {
  static isNamedVectors: <T>(opts?: BaseNearOptions<T> | undefined) => boolean;
  static isMultiTarget: <T>(opts?: BaseNearOptions<T> | undefined) => boolean;
  static isMultiWeightPerTarget: <T>(opts?: BaseNearOptions<T> | undefined) => boolean;
  static isMultiVector: (vec?: NearVectorInputType) => boolean;
  static isMultiVectorPerTarget: (vec?: NearVectorInputType) => boolean;
  private static common;
  static fetchObjects: <T>(args?: FetchObjectsOptions<T> | undefined) => SearchFetchArgs;
  static fetchObjectById: <T>(
    args: {
      id: string;
    } & FetchObjectByIdOptions<T>
  ) => SearchFetchArgs;
  private static bm25QueryProperties;
  static bm25: <T>(
    args: {
      query: string;
    } & Bm25Options<T>
  ) => SearchBm25Args;
  static isHybridVectorSearch: <T>(
    vector: NearVectorInputType | HybridNearTextSubSearch | HybridNearVectorSubSearch | undefined
  ) => vector is number[] | Record<string, number[] | number[][]>;
  static isHybridNearTextSearch: <T>(
    vector: NearVectorInputType | HybridNearTextSubSearch | HybridNearVectorSubSearch | undefined
  ) => vector is HybridNearTextSubSearch;
  static isHybridNearVectorSearch: <T>(
    vector: NearVectorInputType | HybridNearTextSubSearch | HybridNearVectorSubSearch | undefined
  ) => vector is HybridNearVectorSubSearch;
  private static hybridVector;
  static hybrid: <T>(
    args: {
      query: string;
      supportsTargets: boolean;
      supportsVectorsForTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & HybridOptions<T>
  ) => SearchHybridArgs;
  static nearAudio: <T>(
    args: {
      audio: string;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearAudioArgs;
  static nearDepth: <T>(
    args: {
      depth: string;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearDepthArgs;
  static nearImage: <T>(
    args: {
      image: string;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearImageArgs;
  static nearIMU: <T>(
    args: {
      imu: string;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearIMUArgs;
  static nearObject: <T>(
    args: {
      id: string;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearObjectArgs;
  private static nearTextSearch;
  static nearText: <T>(
    args: {
      query: string | string[];
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearTextOptions<T>
  ) => SearchNearTextArgs;
  static nearThermal: <T>(
    args: {
      thermal: string;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearThermalArgs;
  private static vectorToBytes;
  private static nearVectorSearch;
  static targetVector: (args: {
    supportsTargets: boolean;
    supportsWeightsForTargets: boolean;
    targetVector?: TargetVectorInputType;
  }) => {
    targets?: Targets;
    targetVectors?: string[];
  };
  private static vectors;
  private static targets;
  static nearVector: <T>(
    args: {
      vector: NearVectorInputType;
      supportsTargets: boolean;
      supportsVectorsForTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearVectorArgs;
  static nearVideo: <T>(
    args: {
      video: string;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ) => SearchNearVideoArgs;
  static filtersGRPC: (filters: FilterValue) => FiltersGRPC;
  private static filtersGRPCValueText;
  private static filtersGRPCValueTextArray;
  private static filterTargetToREST;
  static filtersREST: (filters: FilterValue) => WhereFilter;
  private static operator;
  private static queryProperties;
  private static metadata;
  private static sortBy;
  static rerank: <T>(rerank: RerankOptions<T>) => Rerank;
  static generative: <T>(generative?: GenerateOptions<T> | undefined) => GenerativeSearch;
  static groupBy: <T>(groupBy?: GroupByOptions<T> | undefined) => GroupBy;
  static isGroupBy: <T>(args: any) => args is T;
  static restProperties: (
    properties: Record<string, WeaviateField>,
    references?: Record<string, ReferenceInput<any>>
  ) => Record<string, any>;
  private static batchProperties;
  static batchObjects: <T>(
    collection: string,
    objects: (DataObject<T> | NonReferenceInputs<T>)[],
    usesNamedVectors: boolean,
    tenant?: string
  ) => Promise<BatchObjects<T>>;
  static tenants<T, M>(tenants: T[], mapper: (tenant: T) => M): M[][];
  static tenantCreate<T extends TenantBC | TenantCreate>(
    tenant: T
  ): {
    name: string;
    activityStatus?: 'HOT' | 'COLD';
  };
  static tenantUpdate<T extends TenantBC | TenantUpdate>(
    tenant: T
  ): {
    name: string;
    activityStatus: 'HOT' | 'COLD' | 'FROZEN';
  };
}
