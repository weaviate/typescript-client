import _m0 from 'protobufjs/minimal.js';
import {
  BooleanArrayProperties,
  ConsistencyLevel,
  Filters,
  IntArrayProperties,
  NumberArrayProperties,
  ObjectArrayProperties,
  ObjectProperties,
  TextArrayProperties,
  Vectors,
} from './base.js';
import { GenerativeReply, GenerativeResult, GenerativeSearch } from './generative.js';
import { Properties } from './properties.js';
export declare const protobufPackage = 'weaviate.v1';
export declare enum CombinationMethod {
  COMBINATION_METHOD_UNSPECIFIED = 0,
  COMBINATION_METHOD_TYPE_SUM = 1,
  COMBINATION_METHOD_TYPE_MIN = 2,
  COMBINATION_METHOD_TYPE_AVERAGE = 3,
  COMBINATION_METHOD_TYPE_RELATIVE_SCORE = 4,
  COMBINATION_METHOD_TYPE_MANUAL = 5,
  UNRECOGNIZED = -1,
}
export declare function combinationMethodFromJSON(object: any): CombinationMethod;
export declare function combinationMethodToJSON(object: CombinationMethod): string;
export interface SearchRequest {
  /** required */
  collection: string;
  /** parameters */
  tenant: string;
  consistencyLevel?: ConsistencyLevel | undefined;
  /** what is returned */
  properties?: PropertiesRequest | undefined;
  metadata?: MetadataRequest | undefined;
  groupBy?: GroupBy | undefined;
  /** affects order and length of results. 0/empty (default value) means disabled */
  limit: number;
  offset: number;
  autocut: number;
  after: string;
  /** protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED */
  sortBy: SortBy[];
  /** matches/searches for objects */
  filters?: Filters | undefined;
  hybridSearch?: Hybrid | undefined;
  bm25Search?: BM25 | undefined;
  nearVector?: NearVector | undefined;
  nearObject?: NearObject | undefined;
  nearText?: NearTextSearch | undefined;
  nearImage?: NearImageSearch | undefined;
  nearAudio?: NearAudioSearch | undefined;
  nearVideo?: NearVideoSearch | undefined;
  nearDepth?: NearDepthSearch | undefined;
  nearThermal?: NearThermalSearch | undefined;
  nearImu?: NearIMUSearch | undefined;
  generative?: GenerativeSearch | undefined;
  rerank?: Rerank | undefined;
  /** @deprecated */
  uses123Api: boolean;
  /** @deprecated */
  uses125Api: boolean;
  uses127Api: boolean;
}
export interface GroupBy {
  /**
   * currently only supports one entry (eg just properties, no refs). But might
   * be extended in the future.
   * protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED
   */
  path: string[];
  numberOfGroups: number;
  objectsPerGroup: number;
}
export interface SortBy {
  ascending: boolean;
  /**
   * currently only supports one entry (eg just properties, no refs). But the
   * weaviate datastructure already has paths in it and this makes it easily
   * extendable in the future
   * protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED
   */
  path: string[];
}
export interface MetadataRequest {
  uuid: boolean;
  vector: boolean;
  creationTimeUnix: boolean;
  lastUpdateTimeUnix: boolean;
  distance: boolean;
  certainty: boolean;
  score: boolean;
  explainScore: boolean;
  isConsistent: boolean;
  vectors: string[];
}
export interface PropertiesRequest {
  nonRefProperties: string[];
  refProperties: RefPropertiesRequest[];
  objectProperties: ObjectPropertiesRequest[];
  returnAllNonrefProperties: boolean;
}
export interface ObjectPropertiesRequest {
  propName: string;
  primitiveProperties: string[];
  objectProperties: ObjectPropertiesRequest[];
}
export interface WeightsForTarget {
  target: string;
  weight: number;
}
export interface Targets {
  targetVectors: string[];
  combination: CombinationMethod;
  /**
   * deprecated in 1.26.2 - use weights_for_targets
   *
   * @deprecated
   */
  weights: {
    [key: string]: number;
  };
  weightsForTargets: WeightsForTarget[];
}
export interface Targets_WeightsEntry {
  key: string;
  value: number;
}
export interface Hybrid {
  query: string;
  properties: string[];
  /**
   * protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED
   *
   * @deprecated
   */
  vector: number[];
  alpha: number;
  fusionType: Hybrid_FusionType;
  vectorBytes: Uint8Array;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  /** targets in msg is ignored and should not be set for hybrid */
  nearText: NearTextSearch | undefined;
  /** same as above. Use the target vector in the hybrid message */
  nearVector: NearVector | undefined;
  targets: Targets | undefined;
  vectorDistance?: number | undefined;
}
export declare enum Hybrid_FusionType {
  FUSION_TYPE_UNSPECIFIED = 0,
  FUSION_TYPE_RANKED = 1,
  FUSION_TYPE_RELATIVE_SCORE = 2,
  UNRECOGNIZED = -1,
}
export declare function hybrid_FusionTypeFromJSON(object: any): Hybrid_FusionType;
export declare function hybrid_FusionTypeToJSON(object: Hybrid_FusionType): string;
export interface NearTextSearch {
  /** protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED */
  query: string[];
  certainty?: number | undefined;
  distance?: number | undefined;
  moveTo?: NearTextSearch_Move | undefined;
  moveAway?: NearTextSearch_Move | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface NearTextSearch_Move {
  force: number;
  concepts: string[];
  uuids: string[];
}
export interface NearImageSearch {
  image: string;
  certainty?: number | undefined;
  distance?: number | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface NearAudioSearch {
  audio: string;
  certainty?: number | undefined;
  distance?: number | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface NearVideoSearch {
  video: string;
  certainty?: number | undefined;
  distance?: number | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface NearDepthSearch {
  depth: string;
  certainty?: number | undefined;
  distance?: number | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface NearThermalSearch {
  thermal: string;
  certainty?: number | undefined;
  distance?: number | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface NearIMUSearch {
  imu: string;
  certainty?: number | undefined;
  distance?: number | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface BM25 {
  query: string;
  properties: string[];
}
export interface RefPropertiesRequest {
  referenceProperty: string;
  properties: PropertiesRequest | undefined;
  metadata: MetadataRequest | undefined;
  targetCollection: string;
}
export interface VectorForTarget {
  name: string;
  vectorBytes: Uint8Array;
}
export interface NearVector {
  /**
   * protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED
   *
   * @deprecated
   */
  vector: number[];
  certainty?: number | undefined;
  distance?: number | undefined;
  vectorBytes: Uint8Array;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
  /**
   * deprecated in 1.26.2 - use vector_for_targets
   *
   * @deprecated
   */
  vectorPerTarget: {
    [key: string]: Uint8Array;
  };
  vectorForTargets: VectorForTarget[];
}
export interface NearVector_VectorPerTargetEntry {
  key: string;
  value: Uint8Array;
}
export interface NearObject {
  id: string;
  certainty?: number | undefined;
  distance?: number | undefined;
  /**
   * deprecated in 1.26 - use targets
   *
   * @deprecated
   */
  targetVectors: string[];
  targets: Targets | undefined;
}
export interface Rerank {
  property: string;
  query?: string | undefined;
}
export interface SearchReply {
  took: number;
  results: SearchResult[];
  /** @deprecated */
  generativeGroupedResult?: string | undefined;
  groupByResults: GroupByResult[];
  generativeGroupedResults?: GenerativeResult | undefined;
}
export interface RerankReply {
  score: number;
}
export interface GroupByResult {
  name: string;
  minDistance: number;
  maxDistance: number;
  numberOfObjects: number;
  objects: SearchResult[];
  rerank?: RerankReply | undefined;
  /** @deprecated */
  generative?: GenerativeReply | undefined;
  generativeResult?: GenerativeResult | undefined;
}
export interface SearchResult {
  properties: PropertiesResult | undefined;
  metadata: MetadataResult | undefined;
  generative?: GenerativeResult | undefined;
}
export interface MetadataResult {
  id: string;
  /**
   * protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED
   *
   * @deprecated
   */
  vector: number[];
  creationTimeUnix: number;
  creationTimeUnixPresent: boolean;
  lastUpdateTimeUnix: number;
  lastUpdateTimeUnixPresent: boolean;
  distance: number;
  distancePresent: boolean;
  certainty: number;
  certaintyPresent: boolean;
  score: number;
  scorePresent: boolean;
  explainScore: string;
  explainScorePresent: boolean;
  isConsistent?: boolean | undefined;
  /** @deprecated */
  generative: string;
  /** @deprecated */
  generativePresent: boolean;
  isConsistentPresent: boolean;
  vectorBytes: Uint8Array;
  idAsBytes: Uint8Array;
  rerankScore: number;
  rerankScorePresent: boolean;
  vectors: Vectors[];
}
export interface PropertiesResult {
  /** @deprecated */
  nonRefProperties:
    | {
        [key: string]: any;
      }
    | undefined;
  refProps: RefPropertiesResult[];
  targetCollection: string;
  metadata: MetadataResult | undefined;
  /** @deprecated */
  numberArrayProperties: NumberArrayProperties[];
  /** @deprecated */
  intArrayProperties: IntArrayProperties[];
  /** @deprecated */
  textArrayProperties: TextArrayProperties[];
  /** @deprecated */
  booleanArrayProperties: BooleanArrayProperties[];
  /** @deprecated */
  objectProperties: ObjectProperties[];
  /** @deprecated */
  objectArrayProperties: ObjectArrayProperties[];
  nonRefProps: Properties | undefined;
  refPropsRequested: boolean;
}
export interface RefPropertiesResult {
  properties: PropertiesResult[];
  propName: string;
}
export declare const SearchRequest: {
  encode(message: SearchRequest, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SearchRequest;
  fromJSON(object: any): SearchRequest;
  toJSON(message: SearchRequest): unknown;
  create(base?: DeepPartial<SearchRequest>): SearchRequest;
  fromPartial(object: DeepPartial<SearchRequest>): SearchRequest;
};
export declare const GroupBy: {
  encode(message: GroupBy, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GroupBy;
  fromJSON(object: any): GroupBy;
  toJSON(message: GroupBy): unknown;
  create(base?: DeepPartial<GroupBy>): GroupBy;
  fromPartial(object: DeepPartial<GroupBy>): GroupBy;
};
export declare const SortBy: {
  encode(message: SortBy, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SortBy;
  fromJSON(object: any): SortBy;
  toJSON(message: SortBy): unknown;
  create(base?: DeepPartial<SortBy>): SortBy;
  fromPartial(object: DeepPartial<SortBy>): SortBy;
};
export declare const MetadataRequest: {
  encode(message: MetadataRequest, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MetadataRequest;
  fromJSON(object: any): MetadataRequest;
  toJSON(message: MetadataRequest): unknown;
  create(base?: DeepPartial<MetadataRequest>): MetadataRequest;
  fromPartial(object: DeepPartial<MetadataRequest>): MetadataRequest;
};
export declare const PropertiesRequest: {
  encode(message: PropertiesRequest, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): PropertiesRequest;
  fromJSON(object: any): PropertiesRequest;
  toJSON(message: PropertiesRequest): unknown;
  create(base?: DeepPartial<PropertiesRequest>): PropertiesRequest;
  fromPartial(object: DeepPartial<PropertiesRequest>): PropertiesRequest;
};
export declare const ObjectPropertiesRequest: {
  encode(message: ObjectPropertiesRequest, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): ObjectPropertiesRequest;
  fromJSON(object: any): ObjectPropertiesRequest;
  toJSON(message: ObjectPropertiesRequest): unknown;
  create(base?: DeepPartial<ObjectPropertiesRequest>): ObjectPropertiesRequest;
  fromPartial(object: DeepPartial<ObjectPropertiesRequest>): ObjectPropertiesRequest;
};
export declare const WeightsForTarget: {
  encode(message: WeightsForTarget, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): WeightsForTarget;
  fromJSON(object: any): WeightsForTarget;
  toJSON(message: WeightsForTarget): unknown;
  create(base?: DeepPartial<WeightsForTarget>): WeightsForTarget;
  fromPartial(object: DeepPartial<WeightsForTarget>): WeightsForTarget;
};
export declare const Targets: {
  encode(message: Targets, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Targets;
  fromJSON(object: any): Targets;
  toJSON(message: Targets): unknown;
  create(base?: DeepPartial<Targets>): Targets;
  fromPartial(object: DeepPartial<Targets>): Targets;
};
export declare const Targets_WeightsEntry: {
  encode(message: Targets_WeightsEntry, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Targets_WeightsEntry;
  fromJSON(object: any): Targets_WeightsEntry;
  toJSON(message: Targets_WeightsEntry): unknown;
  create(base?: DeepPartial<Targets_WeightsEntry>): Targets_WeightsEntry;
  fromPartial(object: DeepPartial<Targets_WeightsEntry>): Targets_WeightsEntry;
};
export declare const Hybrid: {
  encode(message: Hybrid, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Hybrid;
  fromJSON(object: any): Hybrid;
  toJSON(message: Hybrid): unknown;
  create(base?: DeepPartial<Hybrid>): Hybrid;
  fromPartial(object: DeepPartial<Hybrid>): Hybrid;
};
export declare const NearTextSearch: {
  encode(message: NearTextSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearTextSearch;
  fromJSON(object: any): NearTextSearch;
  toJSON(message: NearTextSearch): unknown;
  create(base?: DeepPartial<NearTextSearch>): NearTextSearch;
  fromPartial(object: DeepPartial<NearTextSearch>): NearTextSearch;
};
export declare const NearTextSearch_Move: {
  encode(message: NearTextSearch_Move, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearTextSearch_Move;
  fromJSON(object: any): NearTextSearch_Move;
  toJSON(message: NearTextSearch_Move): unknown;
  create(base?: DeepPartial<NearTextSearch_Move>): NearTextSearch_Move;
  fromPartial(object: DeepPartial<NearTextSearch_Move>): NearTextSearch_Move;
};
export declare const NearImageSearch: {
  encode(message: NearImageSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearImageSearch;
  fromJSON(object: any): NearImageSearch;
  toJSON(message: NearImageSearch): unknown;
  create(base?: DeepPartial<NearImageSearch>): NearImageSearch;
  fromPartial(object: DeepPartial<NearImageSearch>): NearImageSearch;
};
export declare const NearAudioSearch: {
  encode(message: NearAudioSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearAudioSearch;
  fromJSON(object: any): NearAudioSearch;
  toJSON(message: NearAudioSearch): unknown;
  create(base?: DeepPartial<NearAudioSearch>): NearAudioSearch;
  fromPartial(object: DeepPartial<NearAudioSearch>): NearAudioSearch;
};
export declare const NearVideoSearch: {
  encode(message: NearVideoSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearVideoSearch;
  fromJSON(object: any): NearVideoSearch;
  toJSON(message: NearVideoSearch): unknown;
  create(base?: DeepPartial<NearVideoSearch>): NearVideoSearch;
  fromPartial(object: DeepPartial<NearVideoSearch>): NearVideoSearch;
};
export declare const NearDepthSearch: {
  encode(message: NearDepthSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearDepthSearch;
  fromJSON(object: any): NearDepthSearch;
  toJSON(message: NearDepthSearch): unknown;
  create(base?: DeepPartial<NearDepthSearch>): NearDepthSearch;
  fromPartial(object: DeepPartial<NearDepthSearch>): NearDepthSearch;
};
export declare const NearThermalSearch: {
  encode(message: NearThermalSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearThermalSearch;
  fromJSON(object: any): NearThermalSearch;
  toJSON(message: NearThermalSearch): unknown;
  create(base?: DeepPartial<NearThermalSearch>): NearThermalSearch;
  fromPartial(object: DeepPartial<NearThermalSearch>): NearThermalSearch;
};
export declare const NearIMUSearch: {
  encode(message: NearIMUSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearIMUSearch;
  fromJSON(object: any): NearIMUSearch;
  toJSON(message: NearIMUSearch): unknown;
  create(base?: DeepPartial<NearIMUSearch>): NearIMUSearch;
  fromPartial(object: DeepPartial<NearIMUSearch>): NearIMUSearch;
};
export declare const BM25: {
  encode(message: BM25, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BM25;
  fromJSON(object: any): BM25;
  toJSON(message: BM25): unknown;
  create(base?: DeepPartial<BM25>): BM25;
  fromPartial(object: DeepPartial<BM25>): BM25;
};
export declare const RefPropertiesRequest: {
  encode(message: RefPropertiesRequest, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): RefPropertiesRequest;
  fromJSON(object: any): RefPropertiesRequest;
  toJSON(message: RefPropertiesRequest): unknown;
  create(base?: DeepPartial<RefPropertiesRequest>): RefPropertiesRequest;
  fromPartial(object: DeepPartial<RefPropertiesRequest>): RefPropertiesRequest;
};
export declare const VectorForTarget: {
  encode(message: VectorForTarget, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): VectorForTarget;
  fromJSON(object: any): VectorForTarget;
  toJSON(message: VectorForTarget): unknown;
  create(base?: DeepPartial<VectorForTarget>): VectorForTarget;
  fromPartial(object: DeepPartial<VectorForTarget>): VectorForTarget;
};
export declare const NearVector: {
  encode(message: NearVector, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearVector;
  fromJSON(object: any): NearVector;
  toJSON(message: NearVector): unknown;
  create(base?: DeepPartial<NearVector>): NearVector;
  fromPartial(object: DeepPartial<NearVector>): NearVector;
};
export declare const NearVector_VectorPerTargetEntry: {
  encode(message: NearVector_VectorPerTargetEntry, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearVector_VectorPerTargetEntry;
  fromJSON(object: any): NearVector_VectorPerTargetEntry;
  toJSON(message: NearVector_VectorPerTargetEntry): unknown;
  create(base?: DeepPartial<NearVector_VectorPerTargetEntry>): NearVector_VectorPerTargetEntry;
  fromPartial(object: DeepPartial<NearVector_VectorPerTargetEntry>): NearVector_VectorPerTargetEntry;
};
export declare const NearObject: {
  encode(message: NearObject, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): NearObject;
  fromJSON(object: any): NearObject;
  toJSON(message: NearObject): unknown;
  create(base?: DeepPartial<NearObject>): NearObject;
  fromPartial(object: DeepPartial<NearObject>): NearObject;
};
export declare const Rerank: {
  encode(message: Rerank, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): Rerank;
  fromJSON(object: any): Rerank;
  toJSON(message: Rerank): unknown;
  create(base?: DeepPartial<Rerank>): Rerank;
  fromPartial(object: DeepPartial<Rerank>): Rerank;
};
export declare const SearchReply: {
  encode(message: SearchReply, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SearchReply;
  fromJSON(object: any): SearchReply;
  toJSON(message: SearchReply): unknown;
  create(base?: DeepPartial<SearchReply>): SearchReply;
  fromPartial(object: DeepPartial<SearchReply>): SearchReply;
};
export declare const RerankReply: {
  encode(message: RerankReply, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): RerankReply;
  fromJSON(object: any): RerankReply;
  toJSON(message: RerankReply): unknown;
  create(base?: DeepPartial<RerankReply>): RerankReply;
  fromPartial(object: DeepPartial<RerankReply>): RerankReply;
};
export declare const GroupByResult: {
  encode(message: GroupByResult, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GroupByResult;
  fromJSON(object: any): GroupByResult;
  toJSON(message: GroupByResult): unknown;
  create(base?: DeepPartial<GroupByResult>): GroupByResult;
  fromPartial(object: DeepPartial<GroupByResult>): GroupByResult;
};
export declare const SearchResult: {
  encode(message: SearchResult, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): SearchResult;
  fromJSON(object: any): SearchResult;
  toJSON(message: SearchResult): unknown;
  create(base?: DeepPartial<SearchResult>): SearchResult;
  fromPartial(object: DeepPartial<SearchResult>): SearchResult;
};
export declare const MetadataResult: {
  encode(message: MetadataResult, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): MetadataResult;
  fromJSON(object: any): MetadataResult;
  toJSON(message: MetadataResult): unknown;
  create(base?: DeepPartial<MetadataResult>): MetadataResult;
  fromPartial(object: DeepPartial<MetadataResult>): MetadataResult;
};
export declare const PropertiesResult: {
  encode(message: PropertiesResult, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): PropertiesResult;
  fromJSON(object: any): PropertiesResult;
  toJSON(message: PropertiesResult): unknown;
  create(base?: DeepPartial<PropertiesResult>): PropertiesResult;
  fromPartial(object: DeepPartial<PropertiesResult>): PropertiesResult;
};
export declare const RefPropertiesResult: {
  encode(message: RefPropertiesResult, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): RefPropertiesResult;
  fromJSON(object: any): RefPropertiesResult;
  toJSON(message: RefPropertiesResult): unknown;
  create(base?: DeepPartial<RefPropertiesResult>): RefPropertiesResult;
  fromPartial(object: DeepPartial<RefPropertiesResult>): RefPropertiesResult;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends globalThis.Array<infer U>
  ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : Partial<T>;
export {};
