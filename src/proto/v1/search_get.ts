/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Struct } from "../google/protobuf/struct";
import {
  BooleanArrayProperties,
  ConsistencyLevel,
  consistencyLevelFromJSON,
  consistencyLevelToJSON,
  IntArrayProperties,
  NumberArrayProperties,
  ObjectArrayProperties,
  ObjectProperties,
  TextArrayProperties,
} from "./base";
import { Properties } from "./properties";

export const protobufPackage = "weaviate.v1";

export interface SearchRequest {
  /** required */
  collection: string;
  /** parameters */
  tenant: string;
  consistencyLevel?:
    | ConsistencyLevel
    | undefined;
  /** what is returned */
  properties?: PropertiesRequest | undefined;
  metadata?: MetadataRequest | undefined;
  groupBy?:
    | GroupBy
    | undefined;
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
  generative?:
    | GenerativeSearch
    | undefined;
  /** @deprecated */
  uses123Api: boolean;
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

export interface GenerativeSearch {
  singleResponsePrompt: string;
  groupedResponseTask: string;
  groupedProperties: string[];
}

export interface TextArray {
  values: string[];
}

export interface IntArray {
  values: number[];
}

export interface NumberArray {
  values: number[];
}

export interface BooleanArray {
  values: boolean[];
}

export interface Filters {
  operator: Filters_Operator;
  /** protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED */
  on: string[];
  filters: Filters[];
  valueText?: string | undefined;
  valueInt?: number | undefined;
  valueBoolean?: boolean | undefined;
  valueNumber?: number | undefined;
  valueTextArray?: TextArray | undefined;
  valueIntArray?: IntArray | undefined;
  valueBooleanArray?: BooleanArray | undefined;
  valueNumberArray?: NumberArray | undefined;
  valueGeo?: GeoCoordinatesFilter | undefined;
}

export enum Filters_Operator {
  OPERATOR_UNSPECIFIED = 0,
  OPERATOR_EQUAL = 1,
  OPERATOR_NOT_EQUAL = 2,
  OPERATOR_GREATER_THAN = 3,
  OPERATOR_GREATER_THAN_EQUAL = 4,
  OPERATOR_LESS_THAN = 5,
  OPERATOR_LESS_THAN_EQUAL = 6,
  OPERATOR_AND = 7,
  OPERATOR_OR = 8,
  OPERATOR_WITHIN_GEO_RANGE = 9,
  OPERATOR_LIKE = 10,
  OPERATOR_IS_NULL = 11,
  OPERATOR_CONTAINS_ANY = 12,
  OPERATOR_CONTAINS_ALL = 13,
  UNRECOGNIZED = -1,
}

export function filters_OperatorFromJSON(object: any): Filters_Operator {
  switch (object) {
    case 0:
    case "OPERATOR_UNSPECIFIED":
      return Filters_Operator.OPERATOR_UNSPECIFIED;
    case 1:
    case "OPERATOR_EQUAL":
      return Filters_Operator.OPERATOR_EQUAL;
    case 2:
    case "OPERATOR_NOT_EQUAL":
      return Filters_Operator.OPERATOR_NOT_EQUAL;
    case 3:
    case "OPERATOR_GREATER_THAN":
      return Filters_Operator.OPERATOR_GREATER_THAN;
    case 4:
    case "OPERATOR_GREATER_THAN_EQUAL":
      return Filters_Operator.OPERATOR_GREATER_THAN_EQUAL;
    case 5:
    case "OPERATOR_LESS_THAN":
      return Filters_Operator.OPERATOR_LESS_THAN;
    case 6:
    case "OPERATOR_LESS_THAN_EQUAL":
      return Filters_Operator.OPERATOR_LESS_THAN_EQUAL;
    case 7:
    case "OPERATOR_AND":
      return Filters_Operator.OPERATOR_AND;
    case 8:
    case "OPERATOR_OR":
      return Filters_Operator.OPERATOR_OR;
    case 9:
    case "OPERATOR_WITHIN_GEO_RANGE":
      return Filters_Operator.OPERATOR_WITHIN_GEO_RANGE;
    case 10:
    case "OPERATOR_LIKE":
      return Filters_Operator.OPERATOR_LIKE;
    case 11:
    case "OPERATOR_IS_NULL":
      return Filters_Operator.OPERATOR_IS_NULL;
    case 12:
    case "OPERATOR_CONTAINS_ANY":
      return Filters_Operator.OPERATOR_CONTAINS_ANY;
    case 13:
    case "OPERATOR_CONTAINS_ALL":
      return Filters_Operator.OPERATOR_CONTAINS_ALL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Filters_Operator.UNRECOGNIZED;
  }
}

export function filters_OperatorToJSON(object: Filters_Operator): string {
  switch (object) {
    case Filters_Operator.OPERATOR_UNSPECIFIED:
      return "OPERATOR_UNSPECIFIED";
    case Filters_Operator.OPERATOR_EQUAL:
      return "OPERATOR_EQUAL";
    case Filters_Operator.OPERATOR_NOT_EQUAL:
      return "OPERATOR_NOT_EQUAL";
    case Filters_Operator.OPERATOR_GREATER_THAN:
      return "OPERATOR_GREATER_THAN";
    case Filters_Operator.OPERATOR_GREATER_THAN_EQUAL:
      return "OPERATOR_GREATER_THAN_EQUAL";
    case Filters_Operator.OPERATOR_LESS_THAN:
      return "OPERATOR_LESS_THAN";
    case Filters_Operator.OPERATOR_LESS_THAN_EQUAL:
      return "OPERATOR_LESS_THAN_EQUAL";
    case Filters_Operator.OPERATOR_AND:
      return "OPERATOR_AND";
    case Filters_Operator.OPERATOR_OR:
      return "OPERATOR_OR";
    case Filters_Operator.OPERATOR_WITHIN_GEO_RANGE:
      return "OPERATOR_WITHIN_GEO_RANGE";
    case Filters_Operator.OPERATOR_LIKE:
      return "OPERATOR_LIKE";
    case Filters_Operator.OPERATOR_IS_NULL:
      return "OPERATOR_IS_NULL";
    case Filters_Operator.OPERATOR_CONTAINS_ANY:
      return "OPERATOR_CONTAINS_ANY";
    case Filters_Operator.OPERATOR_CONTAINS_ALL:
      return "OPERATOR_CONTAINS_ALL";
    case Filters_Operator.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface GeoCoordinatesFilter {
  latitude: number;
  longitude: number;
  distance: number;
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
}

export enum Hybrid_FusionType {
  FUSION_TYPE_UNSPECIFIED = 0,
  FUSION_TYPE_RANKED = 1,
  FUSION_TYPE_RELATIVE_SCORE = 2,
  UNRECOGNIZED = -1,
}

export function hybrid_FusionTypeFromJSON(object: any): Hybrid_FusionType {
  switch (object) {
    case 0:
    case "FUSION_TYPE_UNSPECIFIED":
      return Hybrid_FusionType.FUSION_TYPE_UNSPECIFIED;
    case 1:
    case "FUSION_TYPE_RANKED":
      return Hybrid_FusionType.FUSION_TYPE_RANKED;
    case 2:
    case "FUSION_TYPE_RELATIVE_SCORE":
      return Hybrid_FusionType.FUSION_TYPE_RELATIVE_SCORE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Hybrid_FusionType.UNRECOGNIZED;
  }
}

export function hybrid_FusionTypeToJSON(object: Hybrid_FusionType): string {
  switch (object) {
    case Hybrid_FusionType.FUSION_TYPE_UNSPECIFIED:
      return "FUSION_TYPE_UNSPECIFIED";
    case Hybrid_FusionType.FUSION_TYPE_RANKED:
      return "FUSION_TYPE_RANKED";
    case Hybrid_FusionType.FUSION_TYPE_RELATIVE_SCORE:
      return "FUSION_TYPE_RELATIVE_SCORE";
    case Hybrid_FusionType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface NearTextSearch {
  /** protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED */
  query: string[];
  certainty?: number | undefined;
  distance?: number | undefined;
  moveTo?: NearTextSearch_Move | undefined;
  moveAway?: NearTextSearch_Move | undefined;
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
}

export interface NearAudioSearch {
  audio: string;
  certainty?: number | undefined;
  distance?: number | undefined;
}

export interface NearVideoSearch {
  video: string;
  certainty?: number | undefined;
  distance?: number | undefined;
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
}

export interface NearObject {
  id: string;
  certainty?: number | undefined;
  distance?: number | undefined;
}

export interface SearchReply {
  took: number;
  results: SearchResult[];
  generativeGroupedResult?: string | undefined;
  groupByResults: GroupByResult[];
}

export interface GroupByResult {
  name: string;
  minDistance: number;
  maxDistance: number;
  numberOfObjects: number;
  objects: SearchResult[];
}

export interface SearchResult {
  properties: PropertiesResult | undefined;
  metadata: MetadataResult | undefined;
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
  generative: string;
  generativePresent: boolean;
  isConsistentPresent: boolean;
  vectorBytes: Uint8Array;
  idBytes: Uint8Array;
}

export interface PropertiesResult {
  /** @deprecated */
  nonRefProperties: { [key: string]: any } | undefined;
  refProps: RefPropertiesResult[];
  targetCollection: string;
  metadata:
    | MetadataResult
    | undefined;
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
}

export interface RefPropertiesResult {
  properties: PropertiesResult[];
  propName: string;
}

function createBaseSearchRequest(): SearchRequest {
  return {
    collection: "",
    tenant: "",
    consistencyLevel: undefined,
    properties: undefined,
    metadata: undefined,
    groupBy: undefined,
    limit: 0,
    offset: 0,
    autocut: 0,
    after: "",
    sortBy: [],
    filters: undefined,
    hybridSearch: undefined,
    bm25Search: undefined,
    nearVector: undefined,
    nearObject: undefined,
    nearText: undefined,
    nearImage: undefined,
    nearAudio: undefined,
    nearVideo: undefined,
    generative: undefined,
    uses123Api: false,
  };
}

export const SearchRequest = {
  encode(message: SearchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.collection !== "") {
      writer.uint32(10).string(message.collection);
    }
    if (message.tenant !== "") {
      writer.uint32(82).string(message.tenant);
    }
    if (message.consistencyLevel !== undefined) {
      writer.uint32(88).int32(message.consistencyLevel);
    }
    if (message.properties !== undefined) {
      PropertiesRequest.encode(message.properties, writer.uint32(162).fork()).ldelim();
    }
    if (message.metadata !== undefined) {
      MetadataRequest.encode(message.metadata, writer.uint32(170).fork()).ldelim();
    }
    if (message.groupBy !== undefined) {
      GroupBy.encode(message.groupBy, writer.uint32(178).fork()).ldelim();
    }
    if (message.limit !== 0) {
      writer.uint32(240).uint32(message.limit);
    }
    if (message.offset !== 0) {
      writer.uint32(248).uint32(message.offset);
    }
    if (message.autocut !== 0) {
      writer.uint32(256).uint32(message.autocut);
    }
    if (message.after !== "") {
      writer.uint32(266).string(message.after);
    }
    for (const v of message.sortBy) {
      SortBy.encode(v!, writer.uint32(274).fork()).ldelim();
    }
    if (message.filters !== undefined) {
      Filters.encode(message.filters, writer.uint32(322).fork()).ldelim();
    }
    if (message.hybridSearch !== undefined) {
      Hybrid.encode(message.hybridSearch, writer.uint32(330).fork()).ldelim();
    }
    if (message.bm25Search !== undefined) {
      BM25.encode(message.bm25Search, writer.uint32(338).fork()).ldelim();
    }
    if (message.nearVector !== undefined) {
      NearVector.encode(message.nearVector, writer.uint32(346).fork()).ldelim();
    }
    if (message.nearObject !== undefined) {
      NearObject.encode(message.nearObject, writer.uint32(354).fork()).ldelim();
    }
    if (message.nearText !== undefined) {
      NearTextSearch.encode(message.nearText, writer.uint32(362).fork()).ldelim();
    }
    if (message.nearImage !== undefined) {
      NearImageSearch.encode(message.nearImage, writer.uint32(370).fork()).ldelim();
    }
    if (message.nearAudio !== undefined) {
      NearAudioSearch.encode(message.nearAudio, writer.uint32(378).fork()).ldelim();
    }
    if (message.nearVideo !== undefined) {
      NearVideoSearch.encode(message.nearVideo, writer.uint32(386).fork()).ldelim();
    }
    if (message.generative !== undefined) {
      GenerativeSearch.encode(message.generative, writer.uint32(482).fork()).ldelim();
    }
    if (message.uses123Api === true) {
      writer.uint32(800).bool(message.uses123Api);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collection = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.tenant = reader.string();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.consistencyLevel = reader.int32() as any;
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.properties = PropertiesRequest.decode(reader, reader.uint32());
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.metadata = MetadataRequest.decode(reader, reader.uint32());
          continue;
        case 22:
          if (tag !== 178) {
            break;
          }

          message.groupBy = GroupBy.decode(reader, reader.uint32());
          continue;
        case 30:
          if (tag !== 240) {
            break;
          }

          message.limit = reader.uint32();
          continue;
        case 31:
          if (tag !== 248) {
            break;
          }

          message.offset = reader.uint32();
          continue;
        case 32:
          if (tag !== 256) {
            break;
          }

          message.autocut = reader.uint32();
          continue;
        case 33:
          if (tag !== 266) {
            break;
          }

          message.after = reader.string();
          continue;
        case 34:
          if (tag !== 274) {
            break;
          }

          message.sortBy.push(SortBy.decode(reader, reader.uint32()));
          continue;
        case 40:
          if (tag !== 322) {
            break;
          }

          message.filters = Filters.decode(reader, reader.uint32());
          continue;
        case 41:
          if (tag !== 330) {
            break;
          }

          message.hybridSearch = Hybrid.decode(reader, reader.uint32());
          continue;
        case 42:
          if (tag !== 338) {
            break;
          }

          message.bm25Search = BM25.decode(reader, reader.uint32());
          continue;
        case 43:
          if (tag !== 346) {
            break;
          }

          message.nearVector = NearVector.decode(reader, reader.uint32());
          continue;
        case 44:
          if (tag !== 354) {
            break;
          }

          message.nearObject = NearObject.decode(reader, reader.uint32());
          continue;
        case 45:
          if (tag !== 362) {
            break;
          }

          message.nearText = NearTextSearch.decode(reader, reader.uint32());
          continue;
        case 46:
          if (tag !== 370) {
            break;
          }

          message.nearImage = NearImageSearch.decode(reader, reader.uint32());
          continue;
        case 47:
          if (tag !== 378) {
            break;
          }

          message.nearAudio = NearAudioSearch.decode(reader, reader.uint32());
          continue;
        case 48:
          if (tag !== 386) {
            break;
          }

          message.nearVideo = NearVideoSearch.decode(reader, reader.uint32());
          continue;
        case 60:
          if (tag !== 482) {
            break;
          }

          message.generative = GenerativeSearch.decode(reader, reader.uint32());
          continue;
        case 100:
          if (tag !== 800) {
            break;
          }

          message.uses123Api = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SearchRequest {
    return {
      collection: isSet(object.collection) ? globalThis.String(object.collection) : "",
      tenant: isSet(object.tenant) ? globalThis.String(object.tenant) : "",
      consistencyLevel: isSet(object.consistencyLevel) ? consistencyLevelFromJSON(object.consistencyLevel) : undefined,
      properties: isSet(object.properties) ? PropertiesRequest.fromJSON(object.properties) : undefined,
      metadata: isSet(object.metadata) ? MetadataRequest.fromJSON(object.metadata) : undefined,
      groupBy: isSet(object.groupBy) ? GroupBy.fromJSON(object.groupBy) : undefined,
      limit: isSet(object.limit) ? globalThis.Number(object.limit) : 0,
      offset: isSet(object.offset) ? globalThis.Number(object.offset) : 0,
      autocut: isSet(object.autocut) ? globalThis.Number(object.autocut) : 0,
      after: isSet(object.after) ? globalThis.String(object.after) : "",
      sortBy: globalThis.Array.isArray(object?.sortBy) ? object.sortBy.map((e: any) => SortBy.fromJSON(e)) : [],
      filters: isSet(object.filters) ? Filters.fromJSON(object.filters) : undefined,
      hybridSearch: isSet(object.hybridSearch) ? Hybrid.fromJSON(object.hybridSearch) : undefined,
      bm25Search: isSet(object.bm25Search) ? BM25.fromJSON(object.bm25Search) : undefined,
      nearVector: isSet(object.nearVector) ? NearVector.fromJSON(object.nearVector) : undefined,
      nearObject: isSet(object.nearObject) ? NearObject.fromJSON(object.nearObject) : undefined,
      nearText: isSet(object.nearText) ? NearTextSearch.fromJSON(object.nearText) : undefined,
      nearImage: isSet(object.nearImage) ? NearImageSearch.fromJSON(object.nearImage) : undefined,
      nearAudio: isSet(object.nearAudio) ? NearAudioSearch.fromJSON(object.nearAudio) : undefined,
      nearVideo: isSet(object.nearVideo) ? NearVideoSearch.fromJSON(object.nearVideo) : undefined,
      generative: isSet(object.generative) ? GenerativeSearch.fromJSON(object.generative) : undefined,
      uses123Api: isSet(object.uses123Api) ? globalThis.Boolean(object.uses123Api) : false,
    };
  },

  toJSON(message: SearchRequest): unknown {
    const obj: any = {};
    if (message.collection !== "") {
      obj.collection = message.collection;
    }
    if (message.tenant !== "") {
      obj.tenant = message.tenant;
    }
    if (message.consistencyLevel !== undefined) {
      obj.consistencyLevel = consistencyLevelToJSON(message.consistencyLevel);
    }
    if (message.properties !== undefined) {
      obj.properties = PropertiesRequest.toJSON(message.properties);
    }
    if (message.metadata !== undefined) {
      obj.metadata = MetadataRequest.toJSON(message.metadata);
    }
    if (message.groupBy !== undefined) {
      obj.groupBy = GroupBy.toJSON(message.groupBy);
    }
    if (message.limit !== 0) {
      obj.limit = Math.round(message.limit);
    }
    if (message.offset !== 0) {
      obj.offset = Math.round(message.offset);
    }
    if (message.autocut !== 0) {
      obj.autocut = Math.round(message.autocut);
    }
    if (message.after !== "") {
      obj.after = message.after;
    }
    if (message.sortBy?.length) {
      obj.sortBy = message.sortBy.map((e) => SortBy.toJSON(e));
    }
    if (message.filters !== undefined) {
      obj.filters = Filters.toJSON(message.filters);
    }
    if (message.hybridSearch !== undefined) {
      obj.hybridSearch = Hybrid.toJSON(message.hybridSearch);
    }
    if (message.bm25Search !== undefined) {
      obj.bm25Search = BM25.toJSON(message.bm25Search);
    }
    if (message.nearVector !== undefined) {
      obj.nearVector = NearVector.toJSON(message.nearVector);
    }
    if (message.nearObject !== undefined) {
      obj.nearObject = NearObject.toJSON(message.nearObject);
    }
    if (message.nearText !== undefined) {
      obj.nearText = NearTextSearch.toJSON(message.nearText);
    }
    if (message.nearImage !== undefined) {
      obj.nearImage = NearImageSearch.toJSON(message.nearImage);
    }
    if (message.nearAudio !== undefined) {
      obj.nearAudio = NearAudioSearch.toJSON(message.nearAudio);
    }
    if (message.nearVideo !== undefined) {
      obj.nearVideo = NearVideoSearch.toJSON(message.nearVideo);
    }
    if (message.generative !== undefined) {
      obj.generative = GenerativeSearch.toJSON(message.generative);
    }
    if (message.uses123Api === true) {
      obj.uses123Api = message.uses123Api;
    }
    return obj;
  },

  create(base?: DeepPartial<SearchRequest>): SearchRequest {
    return SearchRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchRequest>): SearchRequest {
    const message = createBaseSearchRequest();
    message.collection = object.collection ?? "";
    message.tenant = object.tenant ?? "";
    message.consistencyLevel = object.consistencyLevel ?? undefined;
    message.properties = (object.properties !== undefined && object.properties !== null)
      ? PropertiesRequest.fromPartial(object.properties)
      : undefined;
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? MetadataRequest.fromPartial(object.metadata)
      : undefined;
    message.groupBy = (object.groupBy !== undefined && object.groupBy !== null)
      ? GroupBy.fromPartial(object.groupBy)
      : undefined;
    message.limit = object.limit ?? 0;
    message.offset = object.offset ?? 0;
    message.autocut = object.autocut ?? 0;
    message.after = object.after ?? "";
    message.sortBy = object.sortBy?.map((e) => SortBy.fromPartial(e)) || [];
    message.filters = (object.filters !== undefined && object.filters !== null)
      ? Filters.fromPartial(object.filters)
      : undefined;
    message.hybridSearch = (object.hybridSearch !== undefined && object.hybridSearch !== null)
      ? Hybrid.fromPartial(object.hybridSearch)
      : undefined;
    message.bm25Search = (object.bm25Search !== undefined && object.bm25Search !== null)
      ? BM25.fromPartial(object.bm25Search)
      : undefined;
    message.nearVector = (object.nearVector !== undefined && object.nearVector !== null)
      ? NearVector.fromPartial(object.nearVector)
      : undefined;
    message.nearObject = (object.nearObject !== undefined && object.nearObject !== null)
      ? NearObject.fromPartial(object.nearObject)
      : undefined;
    message.nearText = (object.nearText !== undefined && object.nearText !== null)
      ? NearTextSearch.fromPartial(object.nearText)
      : undefined;
    message.nearImage = (object.nearImage !== undefined && object.nearImage !== null)
      ? NearImageSearch.fromPartial(object.nearImage)
      : undefined;
    message.nearAudio = (object.nearAudio !== undefined && object.nearAudio !== null)
      ? NearAudioSearch.fromPartial(object.nearAudio)
      : undefined;
    message.nearVideo = (object.nearVideo !== undefined && object.nearVideo !== null)
      ? NearVideoSearch.fromPartial(object.nearVideo)
      : undefined;
    message.generative = (object.generative !== undefined && object.generative !== null)
      ? GenerativeSearch.fromPartial(object.generative)
      : undefined;
    message.uses123Api = object.uses123Api ?? false;
    return message;
  },
};

function createBaseGroupBy(): GroupBy {
  return { path: [], numberOfGroups: 0, objectsPerGroup: 0 };
}

export const GroupBy = {
  encode(message: GroupBy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.path) {
      writer.uint32(10).string(v!);
    }
    if (message.numberOfGroups !== 0) {
      writer.uint32(16).int32(message.numberOfGroups);
    }
    if (message.objectsPerGroup !== 0) {
      writer.uint32(24).int32(message.objectsPerGroup);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupBy {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupBy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.path.push(reader.string());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.numberOfGroups = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.objectsPerGroup = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GroupBy {
    return {
      path: globalThis.Array.isArray(object?.path) ? object.path.map((e: any) => globalThis.String(e)) : [],
      numberOfGroups: isSet(object.numberOfGroups) ? globalThis.Number(object.numberOfGroups) : 0,
      objectsPerGroup: isSet(object.objectsPerGroup) ? globalThis.Number(object.objectsPerGroup) : 0,
    };
  },

  toJSON(message: GroupBy): unknown {
    const obj: any = {};
    if (message.path?.length) {
      obj.path = message.path;
    }
    if (message.numberOfGroups !== 0) {
      obj.numberOfGroups = Math.round(message.numberOfGroups);
    }
    if (message.objectsPerGroup !== 0) {
      obj.objectsPerGroup = Math.round(message.objectsPerGroup);
    }
    return obj;
  },

  create(base?: DeepPartial<GroupBy>): GroupBy {
    return GroupBy.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GroupBy>): GroupBy {
    const message = createBaseGroupBy();
    message.path = object.path?.map((e) => e) || [];
    message.numberOfGroups = object.numberOfGroups ?? 0;
    message.objectsPerGroup = object.objectsPerGroup ?? 0;
    return message;
  },
};

function createBaseSortBy(): SortBy {
  return { ascending: false, path: [] };
}

export const SortBy = {
  encode(message: SortBy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ascending === true) {
      writer.uint32(8).bool(message.ascending);
    }
    for (const v of message.path) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SortBy {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSortBy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.ascending = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.path.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SortBy {
    return {
      ascending: isSet(object.ascending) ? globalThis.Boolean(object.ascending) : false,
      path: globalThis.Array.isArray(object?.path) ? object.path.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: SortBy): unknown {
    const obj: any = {};
    if (message.ascending === true) {
      obj.ascending = message.ascending;
    }
    if (message.path?.length) {
      obj.path = message.path;
    }
    return obj;
  },

  create(base?: DeepPartial<SortBy>): SortBy {
    return SortBy.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SortBy>): SortBy {
    const message = createBaseSortBy();
    message.ascending = object.ascending ?? false;
    message.path = object.path?.map((e) => e) || [];
    return message;
  },
};

function createBaseGenerativeSearch(): GenerativeSearch {
  return { singleResponsePrompt: "", groupedResponseTask: "", groupedProperties: [] };
}

export const GenerativeSearch = {
  encode(message: GenerativeSearch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.singleResponsePrompt !== "") {
      writer.uint32(10).string(message.singleResponsePrompt);
    }
    if (message.groupedResponseTask !== "") {
      writer.uint32(18).string(message.groupedResponseTask);
    }
    for (const v of message.groupedProperties) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeSearch {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenerativeSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.singleResponsePrompt = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.groupedResponseTask = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.groupedProperties.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GenerativeSearch {
    return {
      singleResponsePrompt: isSet(object.singleResponsePrompt) ? globalThis.String(object.singleResponsePrompt) : "",
      groupedResponseTask: isSet(object.groupedResponseTask) ? globalThis.String(object.groupedResponseTask) : "",
      groupedProperties: globalThis.Array.isArray(object?.groupedProperties)
        ? object.groupedProperties.map((e: any) => globalThis.String(e))
        : [],
    };
  },

  toJSON(message: GenerativeSearch): unknown {
    const obj: any = {};
    if (message.singleResponsePrompt !== "") {
      obj.singleResponsePrompt = message.singleResponsePrompt;
    }
    if (message.groupedResponseTask !== "") {
      obj.groupedResponseTask = message.groupedResponseTask;
    }
    if (message.groupedProperties?.length) {
      obj.groupedProperties = message.groupedProperties;
    }
    return obj;
  },

  create(base?: DeepPartial<GenerativeSearch>): GenerativeSearch {
    return GenerativeSearch.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GenerativeSearch>): GenerativeSearch {
    const message = createBaseGenerativeSearch();
    message.singleResponsePrompt = object.singleResponsePrompt ?? "";
    message.groupedResponseTask = object.groupedResponseTask ?? "";
    message.groupedProperties = object.groupedProperties?.map((e) => e) || [];
    return message;
  },
};

function createBaseTextArray(): TextArray {
  return { values: [] };
}

export const TextArray = {
  encode(message: TextArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TextArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTextArray();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TextArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: TextArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<TextArray>): TextArray {
    return TextArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TextArray>): TextArray {
    const message = createBaseTextArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseIntArray(): IntArray {
  return { values: [] };
}

export const IntArray = {
  encode(message: IntArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.int64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IntArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIntArray();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.values.push(longToNumber(reader.int64() as Long));

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.values.push(longToNumber(reader.int64() as Long));
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): IntArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Number(e)) : [],
    };
  },

  toJSON(message: IntArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values.map((e) => Math.round(e));
    }
    return obj;
  },

  create(base?: DeepPartial<IntArray>): IntArray {
    return IntArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IntArray>): IntArray {
    const message = createBaseIntArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseNumberArray(): NumberArray {
  return { values: [] };
}

export const NumberArray = {
  encode(message: NumberArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.double(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NumberArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNumberArray();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 9) {
            message.values.push(reader.double());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.values.push(reader.double());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NumberArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Number(e)) : [],
    };
  },

  toJSON(message: NumberArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<NumberArray>): NumberArray {
    return NumberArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NumberArray>): NumberArray {
    const message = createBaseNumberArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseBooleanArray(): BooleanArray {
  return { values: [] };
}

export const BooleanArray = {
  encode(message: BooleanArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.bool(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BooleanArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBooleanArray();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.values.push(reader.bool());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.values.push(reader.bool());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BooleanArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Boolean(e)) : [],
    };
  },

  toJSON(message: BooleanArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<BooleanArray>): BooleanArray {
    return BooleanArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BooleanArray>): BooleanArray {
    const message = createBaseBooleanArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseFilters(): Filters {
  return {
    operator: 0,
    on: [],
    filters: [],
    valueText: undefined,
    valueInt: undefined,
    valueBoolean: undefined,
    valueNumber: undefined,
    valueTextArray: undefined,
    valueIntArray: undefined,
    valueBooleanArray: undefined,
    valueNumberArray: undefined,
    valueGeo: undefined,
  };
}

export const Filters = {
  encode(message: Filters, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.operator !== 0) {
      writer.uint32(8).int32(message.operator);
    }
    for (const v of message.on) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.filters) {
      Filters.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.valueText !== undefined) {
      writer.uint32(34).string(message.valueText);
    }
    if (message.valueInt !== undefined) {
      writer.uint32(40).int64(message.valueInt);
    }
    if (message.valueBoolean !== undefined) {
      writer.uint32(48).bool(message.valueBoolean);
    }
    if (message.valueNumber !== undefined) {
      writer.uint32(57).double(message.valueNumber);
    }
    if (message.valueTextArray !== undefined) {
      TextArray.encode(message.valueTextArray, writer.uint32(74).fork()).ldelim();
    }
    if (message.valueIntArray !== undefined) {
      IntArray.encode(message.valueIntArray, writer.uint32(82).fork()).ldelim();
    }
    if (message.valueBooleanArray !== undefined) {
      BooleanArray.encode(message.valueBooleanArray, writer.uint32(90).fork()).ldelim();
    }
    if (message.valueNumberArray !== undefined) {
      NumberArray.encode(message.valueNumberArray, writer.uint32(98).fork()).ldelim();
    }
    if (message.valueGeo !== undefined) {
      GeoCoordinatesFilter.encode(message.valueGeo, writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Filters {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilters();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.operator = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.on.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.filters.push(Filters.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.valueText = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.valueInt = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.valueBoolean = reader.bool();
          continue;
        case 7:
          if (tag !== 57) {
            break;
          }

          message.valueNumber = reader.double();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.valueTextArray = TextArray.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.valueIntArray = IntArray.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.valueBooleanArray = BooleanArray.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.valueNumberArray = NumberArray.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.valueGeo = GeoCoordinatesFilter.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Filters {
    return {
      operator: isSet(object.operator) ? filters_OperatorFromJSON(object.operator) : 0,
      on: globalThis.Array.isArray(object?.on) ? object.on.map((e: any) => globalThis.String(e)) : [],
      filters: globalThis.Array.isArray(object?.filters) ? object.filters.map((e: any) => Filters.fromJSON(e)) : [],
      valueText: isSet(object.valueText) ? globalThis.String(object.valueText) : undefined,
      valueInt: isSet(object.valueInt) ? globalThis.Number(object.valueInt) : undefined,
      valueBoolean: isSet(object.valueBoolean) ? globalThis.Boolean(object.valueBoolean) : undefined,
      valueNumber: isSet(object.valueNumber) ? globalThis.Number(object.valueNumber) : undefined,
      valueTextArray: isSet(object.valueTextArray) ? TextArray.fromJSON(object.valueTextArray) : undefined,
      valueIntArray: isSet(object.valueIntArray) ? IntArray.fromJSON(object.valueIntArray) : undefined,
      valueBooleanArray: isSet(object.valueBooleanArray) ? BooleanArray.fromJSON(object.valueBooleanArray) : undefined,
      valueNumberArray: isSet(object.valueNumberArray) ? NumberArray.fromJSON(object.valueNumberArray) : undefined,
      valueGeo: isSet(object.valueGeo) ? GeoCoordinatesFilter.fromJSON(object.valueGeo) : undefined,
    };
  },

  toJSON(message: Filters): unknown {
    const obj: any = {};
    if (message.operator !== 0) {
      obj.operator = filters_OperatorToJSON(message.operator);
    }
    if (message.on?.length) {
      obj.on = message.on;
    }
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => Filters.toJSON(e));
    }
    if (message.valueText !== undefined) {
      obj.valueText = message.valueText;
    }
    if (message.valueInt !== undefined) {
      obj.valueInt = Math.round(message.valueInt);
    }
    if (message.valueBoolean !== undefined) {
      obj.valueBoolean = message.valueBoolean;
    }
    if (message.valueNumber !== undefined) {
      obj.valueNumber = message.valueNumber;
    }
    if (message.valueTextArray !== undefined) {
      obj.valueTextArray = TextArray.toJSON(message.valueTextArray);
    }
    if (message.valueIntArray !== undefined) {
      obj.valueIntArray = IntArray.toJSON(message.valueIntArray);
    }
    if (message.valueBooleanArray !== undefined) {
      obj.valueBooleanArray = BooleanArray.toJSON(message.valueBooleanArray);
    }
    if (message.valueNumberArray !== undefined) {
      obj.valueNumberArray = NumberArray.toJSON(message.valueNumberArray);
    }
    if (message.valueGeo !== undefined) {
      obj.valueGeo = GeoCoordinatesFilter.toJSON(message.valueGeo);
    }
    return obj;
  },

  create(base?: DeepPartial<Filters>): Filters {
    return Filters.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Filters>): Filters {
    const message = createBaseFilters();
    message.operator = object.operator ?? 0;
    message.on = object.on?.map((e) => e) || [];
    message.filters = object.filters?.map((e) => Filters.fromPartial(e)) || [];
    message.valueText = object.valueText ?? undefined;
    message.valueInt = object.valueInt ?? undefined;
    message.valueBoolean = object.valueBoolean ?? undefined;
    message.valueNumber = object.valueNumber ?? undefined;
    message.valueTextArray = (object.valueTextArray !== undefined && object.valueTextArray !== null)
      ? TextArray.fromPartial(object.valueTextArray)
      : undefined;
    message.valueIntArray = (object.valueIntArray !== undefined && object.valueIntArray !== null)
      ? IntArray.fromPartial(object.valueIntArray)
      : undefined;
    message.valueBooleanArray = (object.valueBooleanArray !== undefined && object.valueBooleanArray !== null)
      ? BooleanArray.fromPartial(object.valueBooleanArray)
      : undefined;
    message.valueNumberArray = (object.valueNumberArray !== undefined && object.valueNumberArray !== null)
      ? NumberArray.fromPartial(object.valueNumberArray)
      : undefined;
    message.valueGeo = (object.valueGeo !== undefined && object.valueGeo !== null)
      ? GeoCoordinatesFilter.fromPartial(object.valueGeo)
      : undefined;
    return message;
  },
};

function createBaseGeoCoordinatesFilter(): GeoCoordinatesFilter {
  return { latitude: 0, longitude: 0, distance: 0 };
}

export const GeoCoordinatesFilter = {
  encode(message: GeoCoordinatesFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.latitude !== 0) {
      writer.uint32(13).float(message.latitude);
    }
    if (message.longitude !== 0) {
      writer.uint32(21).float(message.longitude);
    }
    if (message.distance !== 0) {
      writer.uint32(29).float(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GeoCoordinatesFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGeoCoordinatesFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.latitude = reader.float();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.longitude = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.distance = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GeoCoordinatesFilter {
    return {
      latitude: isSet(object.latitude) ? globalThis.Number(object.latitude) : 0,
      longitude: isSet(object.longitude) ? globalThis.Number(object.longitude) : 0,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : 0,
    };
  },

  toJSON(message: GeoCoordinatesFilter): unknown {
    const obj: any = {};
    if (message.latitude !== 0) {
      obj.latitude = message.latitude;
    }
    if (message.longitude !== 0) {
      obj.longitude = message.longitude;
    }
    if (message.distance !== 0) {
      obj.distance = message.distance;
    }
    return obj;
  },

  create(base?: DeepPartial<GeoCoordinatesFilter>): GeoCoordinatesFilter {
    return GeoCoordinatesFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GeoCoordinatesFilter>): GeoCoordinatesFilter {
    const message = createBaseGeoCoordinatesFilter();
    message.latitude = object.latitude ?? 0;
    message.longitude = object.longitude ?? 0;
    message.distance = object.distance ?? 0;
    return message;
  },
};

function createBaseMetadataRequest(): MetadataRequest {
  return {
    uuid: false,
    vector: false,
    creationTimeUnix: false,
    lastUpdateTimeUnix: false,
    distance: false,
    certainty: false,
    score: false,
    explainScore: false,
    isConsistent: false,
  };
}

export const MetadataRequest = {
  encode(message: MetadataRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid === true) {
      writer.uint32(8).bool(message.uuid);
    }
    if (message.vector === true) {
      writer.uint32(16).bool(message.vector);
    }
    if (message.creationTimeUnix === true) {
      writer.uint32(24).bool(message.creationTimeUnix);
    }
    if (message.lastUpdateTimeUnix === true) {
      writer.uint32(32).bool(message.lastUpdateTimeUnix);
    }
    if (message.distance === true) {
      writer.uint32(40).bool(message.distance);
    }
    if (message.certainty === true) {
      writer.uint32(48).bool(message.certainty);
    }
    if (message.score === true) {
      writer.uint32(56).bool(message.score);
    }
    if (message.explainScore === true) {
      writer.uint32(64).bool(message.explainScore);
    }
    if (message.isConsistent === true) {
      writer.uint32(72).bool(message.isConsistent);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MetadataRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetadataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.uuid = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.vector = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.creationTimeUnix = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.lastUpdateTimeUnix = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.distance = reader.bool();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.certainty = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.score = reader.bool();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.explainScore = reader.bool();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.isConsistent = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MetadataRequest {
    return {
      uuid: isSet(object.uuid) ? globalThis.Boolean(object.uuid) : false,
      vector: isSet(object.vector) ? globalThis.Boolean(object.vector) : false,
      creationTimeUnix: isSet(object.creationTimeUnix) ? globalThis.Boolean(object.creationTimeUnix) : false,
      lastUpdateTimeUnix: isSet(object.lastUpdateTimeUnix) ? globalThis.Boolean(object.lastUpdateTimeUnix) : false,
      distance: isSet(object.distance) ? globalThis.Boolean(object.distance) : false,
      certainty: isSet(object.certainty) ? globalThis.Boolean(object.certainty) : false,
      score: isSet(object.score) ? globalThis.Boolean(object.score) : false,
      explainScore: isSet(object.explainScore) ? globalThis.Boolean(object.explainScore) : false,
      isConsistent: isSet(object.isConsistent) ? globalThis.Boolean(object.isConsistent) : false,
    };
  },

  toJSON(message: MetadataRequest): unknown {
    const obj: any = {};
    if (message.uuid === true) {
      obj.uuid = message.uuid;
    }
    if (message.vector === true) {
      obj.vector = message.vector;
    }
    if (message.creationTimeUnix === true) {
      obj.creationTimeUnix = message.creationTimeUnix;
    }
    if (message.lastUpdateTimeUnix === true) {
      obj.lastUpdateTimeUnix = message.lastUpdateTimeUnix;
    }
    if (message.distance === true) {
      obj.distance = message.distance;
    }
    if (message.certainty === true) {
      obj.certainty = message.certainty;
    }
    if (message.score === true) {
      obj.score = message.score;
    }
    if (message.explainScore === true) {
      obj.explainScore = message.explainScore;
    }
    if (message.isConsistent === true) {
      obj.isConsistent = message.isConsistent;
    }
    return obj;
  },

  create(base?: DeepPartial<MetadataRequest>): MetadataRequest {
    return MetadataRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MetadataRequest>): MetadataRequest {
    const message = createBaseMetadataRequest();
    message.uuid = object.uuid ?? false;
    message.vector = object.vector ?? false;
    message.creationTimeUnix = object.creationTimeUnix ?? false;
    message.lastUpdateTimeUnix = object.lastUpdateTimeUnix ?? false;
    message.distance = object.distance ?? false;
    message.certainty = object.certainty ?? false;
    message.score = object.score ?? false;
    message.explainScore = object.explainScore ?? false;
    message.isConsistent = object.isConsistent ?? false;
    return message;
  },
};

function createBasePropertiesRequest(): PropertiesRequest {
  return { nonRefProperties: [], refProperties: [], objectProperties: [], returnAllNonrefProperties: false };
}

export const PropertiesRequest = {
  encode(message: PropertiesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.nonRefProperties) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.refProperties) {
      RefPropertiesRequest.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.objectProperties) {
      ObjectPropertiesRequest.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.returnAllNonrefProperties === true) {
      writer.uint32(88).bool(message.returnAllNonrefProperties);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PropertiesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePropertiesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.nonRefProperties.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.refProperties.push(RefPropertiesRequest.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.objectProperties.push(ObjectPropertiesRequest.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.returnAllNonrefProperties = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PropertiesRequest {
    return {
      nonRefProperties: globalThis.Array.isArray(object?.nonRefProperties)
        ? object.nonRefProperties.map((e: any) => globalThis.String(e))
        : [],
      refProperties: globalThis.Array.isArray(object?.refProperties)
        ? object.refProperties.map((e: any) => RefPropertiesRequest.fromJSON(e))
        : [],
      objectProperties: globalThis.Array.isArray(object?.objectProperties)
        ? object.objectProperties.map((e: any) => ObjectPropertiesRequest.fromJSON(e))
        : [],
      returnAllNonrefProperties: isSet(object.returnAllNonrefProperties)
        ? globalThis.Boolean(object.returnAllNonrefProperties)
        : false,
    };
  },

  toJSON(message: PropertiesRequest): unknown {
    const obj: any = {};
    if (message.nonRefProperties?.length) {
      obj.nonRefProperties = message.nonRefProperties;
    }
    if (message.refProperties?.length) {
      obj.refProperties = message.refProperties.map((e) => RefPropertiesRequest.toJSON(e));
    }
    if (message.objectProperties?.length) {
      obj.objectProperties = message.objectProperties.map((e) => ObjectPropertiesRequest.toJSON(e));
    }
    if (message.returnAllNonrefProperties === true) {
      obj.returnAllNonrefProperties = message.returnAllNonrefProperties;
    }
    return obj;
  },

  create(base?: DeepPartial<PropertiesRequest>): PropertiesRequest {
    return PropertiesRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PropertiesRequest>): PropertiesRequest {
    const message = createBasePropertiesRequest();
    message.nonRefProperties = object.nonRefProperties?.map((e) => e) || [];
    message.refProperties = object.refProperties?.map((e) => RefPropertiesRequest.fromPartial(e)) || [];
    message.objectProperties = object.objectProperties?.map((e) => ObjectPropertiesRequest.fromPartial(e)) || [];
    message.returnAllNonrefProperties = object.returnAllNonrefProperties ?? false;
    return message;
  },
};

function createBaseObjectPropertiesRequest(): ObjectPropertiesRequest {
  return { propName: "", primitiveProperties: [], objectProperties: [] };
}

export const ObjectPropertiesRequest = {
  encode(message: ObjectPropertiesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.propName !== "") {
      writer.uint32(10).string(message.propName);
    }
    for (const v of message.primitiveProperties) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.objectProperties) {
      ObjectPropertiesRequest.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ObjectPropertiesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseObjectPropertiesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.propName = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.primitiveProperties.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.objectProperties.push(ObjectPropertiesRequest.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ObjectPropertiesRequest {
    return {
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
      primitiveProperties: globalThis.Array.isArray(object?.primitiveProperties)
        ? object.primitiveProperties.map((e: any) => globalThis.String(e))
        : [],
      objectProperties: globalThis.Array.isArray(object?.objectProperties)
        ? object.objectProperties.map((e: any) => ObjectPropertiesRequest.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ObjectPropertiesRequest): unknown {
    const obj: any = {};
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    if (message.primitiveProperties?.length) {
      obj.primitiveProperties = message.primitiveProperties;
    }
    if (message.objectProperties?.length) {
      obj.objectProperties = message.objectProperties.map((e) => ObjectPropertiesRequest.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<ObjectPropertiesRequest>): ObjectPropertiesRequest {
    return ObjectPropertiesRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ObjectPropertiesRequest>): ObjectPropertiesRequest {
    const message = createBaseObjectPropertiesRequest();
    message.propName = object.propName ?? "";
    message.primitiveProperties = object.primitiveProperties?.map((e) => e) || [];
    message.objectProperties = object.objectProperties?.map((e) => ObjectPropertiesRequest.fromPartial(e)) || [];
    return message;
  },
};

function createBaseHybrid(): Hybrid {
  return { query: "", properties: [], vector: [], alpha: 0, fusionType: 0, vectorBytes: new Uint8Array(0) };
}

export const Hybrid = {
  encode(message: Hybrid, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.query !== "") {
      writer.uint32(10).string(message.query);
    }
    for (const v of message.properties) {
      writer.uint32(18).string(v!);
    }
    writer.uint32(26).fork();
    for (const v of message.vector) {
      writer.float(v);
    }
    writer.ldelim();
    if (message.alpha !== 0) {
      writer.uint32(37).float(message.alpha);
    }
    if (message.fusionType !== 0) {
      writer.uint32(40).int32(message.fusionType);
    }
    if (message.vectorBytes.length !== 0) {
      writer.uint32(50).bytes(message.vectorBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Hybrid {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHybrid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.query = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.properties.push(reader.string());
          continue;
        case 3:
          if (tag === 29) {
            message.vector.push(reader.float());

            continue;
          }

          if (tag === 26) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.vector.push(reader.float());
            }

            continue;
          }

          break;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.alpha = reader.float();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.fusionType = reader.int32() as any;
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.vectorBytes = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Hybrid {
    return {
      query: isSet(object.query) ? globalThis.String(object.query) : "",
      properties: globalThis.Array.isArray(object?.properties)
        ? object.properties.map((e: any) => globalThis.String(e))
        : [],
      vector: globalThis.Array.isArray(object?.vector) ? object.vector.map((e: any) => globalThis.Number(e)) : [],
      alpha: isSet(object.alpha) ? globalThis.Number(object.alpha) : 0,
      fusionType: isSet(object.fusionType) ? hybrid_FusionTypeFromJSON(object.fusionType) : 0,
      vectorBytes: isSet(object.vectorBytes) ? bytesFromBase64(object.vectorBytes) : new Uint8Array(0),
    };
  },

  toJSON(message: Hybrid): unknown {
    const obj: any = {};
    if (message.query !== "") {
      obj.query = message.query;
    }
    if (message.properties?.length) {
      obj.properties = message.properties;
    }
    if (message.vector?.length) {
      obj.vector = message.vector;
    }
    if (message.alpha !== 0) {
      obj.alpha = message.alpha;
    }
    if (message.fusionType !== 0) {
      obj.fusionType = hybrid_FusionTypeToJSON(message.fusionType);
    }
    if (message.vectorBytes.length !== 0) {
      obj.vectorBytes = base64FromBytes(message.vectorBytes);
    }
    return obj;
  },

  create(base?: DeepPartial<Hybrid>): Hybrid {
    return Hybrid.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Hybrid>): Hybrid {
    const message = createBaseHybrid();
    message.query = object.query ?? "";
    message.properties = object.properties?.map((e) => e) || [];
    message.vector = object.vector?.map((e) => e) || [];
    message.alpha = object.alpha ?? 0;
    message.fusionType = object.fusionType ?? 0;
    message.vectorBytes = object.vectorBytes ?? new Uint8Array(0);
    return message;
  },
};

function createBaseNearTextSearch(): NearTextSearch {
  return { query: [], certainty: undefined, distance: undefined, moveTo: undefined, moveAway: undefined };
}

export const NearTextSearch = {
  encode(message: NearTextSearch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.query) {
      writer.uint32(10).string(v!);
    }
    if (message.certainty !== undefined) {
      writer.uint32(17).double(message.certainty);
    }
    if (message.distance !== undefined) {
      writer.uint32(25).double(message.distance);
    }
    if (message.moveTo !== undefined) {
      NearTextSearch_Move.encode(message.moveTo, writer.uint32(34).fork()).ldelim();
    }
    if (message.moveAway !== undefined) {
      NearTextSearch_Move.encode(message.moveAway, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NearTextSearch {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNearTextSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.query.push(reader.string());
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.certainty = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.distance = reader.double();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.moveTo = NearTextSearch_Move.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.moveAway = NearTextSearch_Move.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NearTextSearch {
    return {
      query: globalThis.Array.isArray(object?.query) ? object.query.map((e: any) => globalThis.String(e)) : [],
      certainty: isSet(object.certainty) ? globalThis.Number(object.certainty) : undefined,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : undefined,
      moveTo: isSet(object.moveTo) ? NearTextSearch_Move.fromJSON(object.moveTo) : undefined,
      moveAway: isSet(object.moveAway) ? NearTextSearch_Move.fromJSON(object.moveAway) : undefined,
    };
  },

  toJSON(message: NearTextSearch): unknown {
    const obj: any = {};
    if (message.query?.length) {
      obj.query = message.query;
    }
    if (message.certainty !== undefined) {
      obj.certainty = message.certainty;
    }
    if (message.distance !== undefined) {
      obj.distance = message.distance;
    }
    if (message.moveTo !== undefined) {
      obj.moveTo = NearTextSearch_Move.toJSON(message.moveTo);
    }
    if (message.moveAway !== undefined) {
      obj.moveAway = NearTextSearch_Move.toJSON(message.moveAway);
    }
    return obj;
  },

  create(base?: DeepPartial<NearTextSearch>): NearTextSearch {
    return NearTextSearch.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NearTextSearch>): NearTextSearch {
    const message = createBaseNearTextSearch();
    message.query = object.query?.map((e) => e) || [];
    message.certainty = object.certainty ?? undefined;
    message.distance = object.distance ?? undefined;
    message.moveTo = (object.moveTo !== undefined && object.moveTo !== null)
      ? NearTextSearch_Move.fromPartial(object.moveTo)
      : undefined;
    message.moveAway = (object.moveAway !== undefined && object.moveAway !== null)
      ? NearTextSearch_Move.fromPartial(object.moveAway)
      : undefined;
    return message;
  },
};

function createBaseNearTextSearch_Move(): NearTextSearch_Move {
  return { force: 0, concepts: [], uuids: [] };
}

export const NearTextSearch_Move = {
  encode(message: NearTextSearch_Move, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.force !== 0) {
      writer.uint32(13).float(message.force);
    }
    for (const v of message.concepts) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.uuids) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NearTextSearch_Move {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNearTextSearch_Move();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.force = reader.float();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.concepts.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.uuids.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NearTextSearch_Move {
    return {
      force: isSet(object.force) ? globalThis.Number(object.force) : 0,
      concepts: globalThis.Array.isArray(object?.concepts) ? object.concepts.map((e: any) => globalThis.String(e)) : [],
      uuids: globalThis.Array.isArray(object?.uuids) ? object.uuids.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: NearTextSearch_Move): unknown {
    const obj: any = {};
    if (message.force !== 0) {
      obj.force = message.force;
    }
    if (message.concepts?.length) {
      obj.concepts = message.concepts;
    }
    if (message.uuids?.length) {
      obj.uuids = message.uuids;
    }
    return obj;
  },

  create(base?: DeepPartial<NearTextSearch_Move>): NearTextSearch_Move {
    return NearTextSearch_Move.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NearTextSearch_Move>): NearTextSearch_Move {
    const message = createBaseNearTextSearch_Move();
    message.force = object.force ?? 0;
    message.concepts = object.concepts?.map((e) => e) || [];
    message.uuids = object.uuids?.map((e) => e) || [];
    return message;
  },
};

function createBaseNearImageSearch(): NearImageSearch {
  return { image: "", certainty: undefined, distance: undefined };
}

export const NearImageSearch = {
  encode(message: NearImageSearch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.image !== "") {
      writer.uint32(10).string(message.image);
    }
    if (message.certainty !== undefined) {
      writer.uint32(17).double(message.certainty);
    }
    if (message.distance !== undefined) {
      writer.uint32(25).double(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NearImageSearch {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNearImageSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.image = reader.string();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.certainty = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.distance = reader.double();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NearImageSearch {
    return {
      image: isSet(object.image) ? globalThis.String(object.image) : "",
      certainty: isSet(object.certainty) ? globalThis.Number(object.certainty) : undefined,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : undefined,
    };
  },

  toJSON(message: NearImageSearch): unknown {
    const obj: any = {};
    if (message.image !== "") {
      obj.image = message.image;
    }
    if (message.certainty !== undefined) {
      obj.certainty = message.certainty;
    }
    if (message.distance !== undefined) {
      obj.distance = message.distance;
    }
    return obj;
  },

  create(base?: DeepPartial<NearImageSearch>): NearImageSearch {
    return NearImageSearch.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NearImageSearch>): NearImageSearch {
    const message = createBaseNearImageSearch();
    message.image = object.image ?? "";
    message.certainty = object.certainty ?? undefined;
    message.distance = object.distance ?? undefined;
    return message;
  },
};

function createBaseNearAudioSearch(): NearAudioSearch {
  return { audio: "", certainty: undefined, distance: undefined };
}

export const NearAudioSearch = {
  encode(message: NearAudioSearch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.audio !== "") {
      writer.uint32(10).string(message.audio);
    }
    if (message.certainty !== undefined) {
      writer.uint32(17).double(message.certainty);
    }
    if (message.distance !== undefined) {
      writer.uint32(25).double(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NearAudioSearch {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNearAudioSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.audio = reader.string();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.certainty = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.distance = reader.double();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NearAudioSearch {
    return {
      audio: isSet(object.audio) ? globalThis.String(object.audio) : "",
      certainty: isSet(object.certainty) ? globalThis.Number(object.certainty) : undefined,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : undefined,
    };
  },

  toJSON(message: NearAudioSearch): unknown {
    const obj: any = {};
    if (message.audio !== "") {
      obj.audio = message.audio;
    }
    if (message.certainty !== undefined) {
      obj.certainty = message.certainty;
    }
    if (message.distance !== undefined) {
      obj.distance = message.distance;
    }
    return obj;
  },

  create(base?: DeepPartial<NearAudioSearch>): NearAudioSearch {
    return NearAudioSearch.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NearAudioSearch>): NearAudioSearch {
    const message = createBaseNearAudioSearch();
    message.audio = object.audio ?? "";
    message.certainty = object.certainty ?? undefined;
    message.distance = object.distance ?? undefined;
    return message;
  },
};

function createBaseNearVideoSearch(): NearVideoSearch {
  return { video: "", certainty: undefined, distance: undefined };
}

export const NearVideoSearch = {
  encode(message: NearVideoSearch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.video !== "") {
      writer.uint32(10).string(message.video);
    }
    if (message.certainty !== undefined) {
      writer.uint32(17).double(message.certainty);
    }
    if (message.distance !== undefined) {
      writer.uint32(25).double(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NearVideoSearch {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNearVideoSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.video = reader.string();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.certainty = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.distance = reader.double();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NearVideoSearch {
    return {
      video: isSet(object.video) ? globalThis.String(object.video) : "",
      certainty: isSet(object.certainty) ? globalThis.Number(object.certainty) : undefined,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : undefined,
    };
  },

  toJSON(message: NearVideoSearch): unknown {
    const obj: any = {};
    if (message.video !== "") {
      obj.video = message.video;
    }
    if (message.certainty !== undefined) {
      obj.certainty = message.certainty;
    }
    if (message.distance !== undefined) {
      obj.distance = message.distance;
    }
    return obj;
  },

  create(base?: DeepPartial<NearVideoSearch>): NearVideoSearch {
    return NearVideoSearch.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NearVideoSearch>): NearVideoSearch {
    const message = createBaseNearVideoSearch();
    message.video = object.video ?? "";
    message.certainty = object.certainty ?? undefined;
    message.distance = object.distance ?? undefined;
    return message;
  },
};

function createBaseBM25(): BM25 {
  return { query: "", properties: [] };
}

export const BM25 = {
  encode(message: BM25, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.query !== "") {
      writer.uint32(10).string(message.query);
    }
    for (const v of message.properties) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BM25 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBM25();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.query = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.properties.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BM25 {
    return {
      query: isSet(object.query) ? globalThis.String(object.query) : "",
      properties: globalThis.Array.isArray(object?.properties)
        ? object.properties.map((e: any) => globalThis.String(e))
        : [],
    };
  },

  toJSON(message: BM25): unknown {
    const obj: any = {};
    if (message.query !== "") {
      obj.query = message.query;
    }
    if (message.properties?.length) {
      obj.properties = message.properties;
    }
    return obj;
  },

  create(base?: DeepPartial<BM25>): BM25 {
    return BM25.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BM25>): BM25 {
    const message = createBaseBM25();
    message.query = object.query ?? "";
    message.properties = object.properties?.map((e) => e) || [];
    return message;
  },
};

function createBaseRefPropertiesRequest(): RefPropertiesRequest {
  return { referenceProperty: "", properties: undefined, metadata: undefined, targetCollection: "" };
}

export const RefPropertiesRequest = {
  encode(message: RefPropertiesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.referenceProperty !== "") {
      writer.uint32(10).string(message.referenceProperty);
    }
    if (message.properties !== undefined) {
      PropertiesRequest.encode(message.properties, writer.uint32(18).fork()).ldelim();
    }
    if (message.metadata !== undefined) {
      MetadataRequest.encode(message.metadata, writer.uint32(26).fork()).ldelim();
    }
    if (message.targetCollection !== "") {
      writer.uint32(34).string(message.targetCollection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RefPropertiesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRefPropertiesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.referenceProperty = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.properties = PropertiesRequest.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.metadata = MetadataRequest.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.targetCollection = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RefPropertiesRequest {
    return {
      referenceProperty: isSet(object.referenceProperty) ? globalThis.String(object.referenceProperty) : "",
      properties: isSet(object.properties) ? PropertiesRequest.fromJSON(object.properties) : undefined,
      metadata: isSet(object.metadata) ? MetadataRequest.fromJSON(object.metadata) : undefined,
      targetCollection: isSet(object.targetCollection) ? globalThis.String(object.targetCollection) : "",
    };
  },

  toJSON(message: RefPropertiesRequest): unknown {
    const obj: any = {};
    if (message.referenceProperty !== "") {
      obj.referenceProperty = message.referenceProperty;
    }
    if (message.properties !== undefined) {
      obj.properties = PropertiesRequest.toJSON(message.properties);
    }
    if (message.metadata !== undefined) {
      obj.metadata = MetadataRequest.toJSON(message.metadata);
    }
    if (message.targetCollection !== "") {
      obj.targetCollection = message.targetCollection;
    }
    return obj;
  },

  create(base?: DeepPartial<RefPropertiesRequest>): RefPropertiesRequest {
    return RefPropertiesRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RefPropertiesRequest>): RefPropertiesRequest {
    const message = createBaseRefPropertiesRequest();
    message.referenceProperty = object.referenceProperty ?? "";
    message.properties = (object.properties !== undefined && object.properties !== null)
      ? PropertiesRequest.fromPartial(object.properties)
      : undefined;
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? MetadataRequest.fromPartial(object.metadata)
      : undefined;
    message.targetCollection = object.targetCollection ?? "";
    return message;
  },
};

function createBaseNearVector(): NearVector {
  return { vector: [], certainty: undefined, distance: undefined, vectorBytes: new Uint8Array(0) };
}

export const NearVector = {
  encode(message: NearVector, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.vector) {
      writer.float(v);
    }
    writer.ldelim();
    if (message.certainty !== undefined) {
      writer.uint32(17).double(message.certainty);
    }
    if (message.distance !== undefined) {
      writer.uint32(25).double(message.distance);
    }
    if (message.vectorBytes.length !== 0) {
      writer.uint32(34).bytes(message.vectorBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NearVector {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNearVector();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 13) {
            message.vector.push(reader.float());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.vector.push(reader.float());
            }

            continue;
          }

          break;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.certainty = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.distance = reader.double();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.vectorBytes = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NearVector {
    return {
      vector: globalThis.Array.isArray(object?.vector) ? object.vector.map((e: any) => globalThis.Number(e)) : [],
      certainty: isSet(object.certainty) ? globalThis.Number(object.certainty) : undefined,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : undefined,
      vectorBytes: isSet(object.vectorBytes) ? bytesFromBase64(object.vectorBytes) : new Uint8Array(0),
    };
  },

  toJSON(message: NearVector): unknown {
    const obj: any = {};
    if (message.vector?.length) {
      obj.vector = message.vector;
    }
    if (message.certainty !== undefined) {
      obj.certainty = message.certainty;
    }
    if (message.distance !== undefined) {
      obj.distance = message.distance;
    }
    if (message.vectorBytes.length !== 0) {
      obj.vectorBytes = base64FromBytes(message.vectorBytes);
    }
    return obj;
  },

  create(base?: DeepPartial<NearVector>): NearVector {
    return NearVector.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NearVector>): NearVector {
    const message = createBaseNearVector();
    message.vector = object.vector?.map((e) => e) || [];
    message.certainty = object.certainty ?? undefined;
    message.distance = object.distance ?? undefined;
    message.vectorBytes = object.vectorBytes ?? new Uint8Array(0);
    return message;
  },
};

function createBaseNearObject(): NearObject {
  return { id: "", certainty: undefined, distance: undefined };
}

export const NearObject = {
  encode(message: NearObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.certainty !== undefined) {
      writer.uint32(17).double(message.certainty);
    }
    if (message.distance !== undefined) {
      writer.uint32(25).double(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NearObject {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNearObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.certainty = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.distance = reader.double();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NearObject {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      certainty: isSet(object.certainty) ? globalThis.Number(object.certainty) : undefined,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : undefined,
    };
  },

  toJSON(message: NearObject): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.certainty !== undefined) {
      obj.certainty = message.certainty;
    }
    if (message.distance !== undefined) {
      obj.distance = message.distance;
    }
    return obj;
  },

  create(base?: DeepPartial<NearObject>): NearObject {
    return NearObject.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NearObject>): NearObject {
    const message = createBaseNearObject();
    message.id = object.id ?? "";
    message.certainty = object.certainty ?? undefined;
    message.distance = object.distance ?? undefined;
    return message;
  },
};

function createBaseSearchReply(): SearchReply {
  return { took: 0, results: [], generativeGroupedResult: undefined, groupByResults: [] };
}

export const SearchReply = {
  encode(message: SearchReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.took !== 0) {
      writer.uint32(13).float(message.took);
    }
    for (const v of message.results) {
      SearchResult.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.generativeGroupedResult !== undefined) {
      writer.uint32(26).string(message.generativeGroupedResult);
    }
    for (const v of message.groupByResults) {
      GroupByResult.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.took = reader.float();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.results.push(SearchResult.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.generativeGroupedResult = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.groupByResults.push(GroupByResult.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SearchReply {
    return {
      took: isSet(object.took) ? globalThis.Number(object.took) : 0,
      results: globalThis.Array.isArray(object?.results)
        ? object.results.map((e: any) => SearchResult.fromJSON(e))
        : [],
      generativeGroupedResult: isSet(object.generativeGroupedResult)
        ? globalThis.String(object.generativeGroupedResult)
        : undefined,
      groupByResults: globalThis.Array.isArray(object?.groupByResults)
        ? object.groupByResults.map((e: any) => GroupByResult.fromJSON(e))
        : [],
    };
  },

  toJSON(message: SearchReply): unknown {
    const obj: any = {};
    if (message.took !== 0) {
      obj.took = message.took;
    }
    if (message.results?.length) {
      obj.results = message.results.map((e) => SearchResult.toJSON(e));
    }
    if (message.generativeGroupedResult !== undefined) {
      obj.generativeGroupedResult = message.generativeGroupedResult;
    }
    if (message.groupByResults?.length) {
      obj.groupByResults = message.groupByResults.map((e) => GroupByResult.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<SearchReply>): SearchReply {
    return SearchReply.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchReply>): SearchReply {
    const message = createBaseSearchReply();
    message.took = object.took ?? 0;
    message.results = object.results?.map((e) => SearchResult.fromPartial(e)) || [];
    message.generativeGroupedResult = object.generativeGroupedResult ?? undefined;
    message.groupByResults = object.groupByResults?.map((e) => GroupByResult.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGroupByResult(): GroupByResult {
  return { name: "", minDistance: 0, maxDistance: 0, numberOfObjects: 0, objects: [] };
}

export const GroupByResult = {
  encode(message: GroupByResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.minDistance !== 0) {
      writer.uint32(21).float(message.minDistance);
    }
    if (message.maxDistance !== 0) {
      writer.uint32(29).float(message.maxDistance);
    }
    if (message.numberOfObjects !== 0) {
      writer.uint32(32).int64(message.numberOfObjects);
    }
    for (const v of message.objects) {
      SearchResult.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupByResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupByResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.minDistance = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.maxDistance = reader.float();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.numberOfObjects = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.objects.push(SearchResult.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GroupByResult {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      minDistance: isSet(object.minDistance) ? globalThis.Number(object.minDistance) : 0,
      maxDistance: isSet(object.maxDistance) ? globalThis.Number(object.maxDistance) : 0,
      numberOfObjects: isSet(object.numberOfObjects) ? globalThis.Number(object.numberOfObjects) : 0,
      objects: globalThis.Array.isArray(object?.objects)
        ? object.objects.map((e: any) => SearchResult.fromJSON(e))
        : [],
    };
  },

  toJSON(message: GroupByResult): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.minDistance !== 0) {
      obj.minDistance = message.minDistance;
    }
    if (message.maxDistance !== 0) {
      obj.maxDistance = message.maxDistance;
    }
    if (message.numberOfObjects !== 0) {
      obj.numberOfObjects = Math.round(message.numberOfObjects);
    }
    if (message.objects?.length) {
      obj.objects = message.objects.map((e) => SearchResult.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<GroupByResult>): GroupByResult {
    return GroupByResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GroupByResult>): GroupByResult {
    const message = createBaseGroupByResult();
    message.name = object.name ?? "";
    message.minDistance = object.minDistance ?? 0;
    message.maxDistance = object.maxDistance ?? 0;
    message.numberOfObjects = object.numberOfObjects ?? 0;
    message.objects = object.objects?.map((e) => SearchResult.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSearchResult(): SearchResult {
  return { properties: undefined, metadata: undefined };
}

export const SearchResult = {
  encode(message: SearchResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.properties !== undefined) {
      PropertiesResult.encode(message.properties, writer.uint32(10).fork()).ldelim();
    }
    if (message.metadata !== undefined) {
      MetadataResult.encode(message.metadata, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.properties = PropertiesResult.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.metadata = MetadataResult.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SearchResult {
    return {
      properties: isSet(object.properties) ? PropertiesResult.fromJSON(object.properties) : undefined,
      metadata: isSet(object.metadata) ? MetadataResult.fromJSON(object.metadata) : undefined,
    };
  },

  toJSON(message: SearchResult): unknown {
    const obj: any = {};
    if (message.properties !== undefined) {
      obj.properties = PropertiesResult.toJSON(message.properties);
    }
    if (message.metadata !== undefined) {
      obj.metadata = MetadataResult.toJSON(message.metadata);
    }
    return obj;
  },

  create(base?: DeepPartial<SearchResult>): SearchResult {
    return SearchResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchResult>): SearchResult {
    const message = createBaseSearchResult();
    message.properties = (object.properties !== undefined && object.properties !== null)
      ? PropertiesResult.fromPartial(object.properties)
      : undefined;
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? MetadataResult.fromPartial(object.metadata)
      : undefined;
    return message;
  },
};

function createBaseMetadataResult(): MetadataResult {
  return {
    id: "",
    vector: [],
    creationTimeUnix: 0,
    creationTimeUnixPresent: false,
    lastUpdateTimeUnix: 0,
    lastUpdateTimeUnixPresent: false,
    distance: 0,
    distancePresent: false,
    certainty: 0,
    certaintyPresent: false,
    score: 0,
    scorePresent: false,
    explainScore: "",
    explainScorePresent: false,
    isConsistent: undefined,
    generative: "",
    generativePresent: false,
    isConsistentPresent: false,
    vectorBytes: new Uint8Array(0),
    idBytes: new Uint8Array(0),
  };
}

export const MetadataResult = {
  encode(message: MetadataResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    writer.uint32(18).fork();
    for (const v of message.vector) {
      writer.float(v);
    }
    writer.ldelim();
    if (message.creationTimeUnix !== 0) {
      writer.uint32(24).int64(message.creationTimeUnix);
    }
    if (message.creationTimeUnixPresent === true) {
      writer.uint32(32).bool(message.creationTimeUnixPresent);
    }
    if (message.lastUpdateTimeUnix !== 0) {
      writer.uint32(40).int64(message.lastUpdateTimeUnix);
    }
    if (message.lastUpdateTimeUnixPresent === true) {
      writer.uint32(48).bool(message.lastUpdateTimeUnixPresent);
    }
    if (message.distance !== 0) {
      writer.uint32(61).float(message.distance);
    }
    if (message.distancePresent === true) {
      writer.uint32(64).bool(message.distancePresent);
    }
    if (message.certainty !== 0) {
      writer.uint32(77).float(message.certainty);
    }
    if (message.certaintyPresent === true) {
      writer.uint32(80).bool(message.certaintyPresent);
    }
    if (message.score !== 0) {
      writer.uint32(93).float(message.score);
    }
    if (message.scorePresent === true) {
      writer.uint32(96).bool(message.scorePresent);
    }
    if (message.explainScore !== "") {
      writer.uint32(106).string(message.explainScore);
    }
    if (message.explainScorePresent === true) {
      writer.uint32(112).bool(message.explainScorePresent);
    }
    if (message.isConsistent !== undefined) {
      writer.uint32(120).bool(message.isConsistent);
    }
    if (message.generative !== "") {
      writer.uint32(130).string(message.generative);
    }
    if (message.generativePresent === true) {
      writer.uint32(136).bool(message.generativePresent);
    }
    if (message.isConsistentPresent === true) {
      writer.uint32(144).bool(message.isConsistentPresent);
    }
    if (message.vectorBytes.length !== 0) {
      writer.uint32(154).bytes(message.vectorBytes);
    }
    if (message.idBytes.length !== 0) {
      writer.uint32(162).bytes(message.idBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MetadataResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetadataResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag === 21) {
            message.vector.push(reader.float());

            continue;
          }

          if (tag === 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.vector.push(reader.float());
            }

            continue;
          }

          break;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.creationTimeUnix = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.creationTimeUnixPresent = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.lastUpdateTimeUnix = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.lastUpdateTimeUnixPresent = reader.bool();
          continue;
        case 7:
          if (tag !== 61) {
            break;
          }

          message.distance = reader.float();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.distancePresent = reader.bool();
          continue;
        case 9:
          if (tag !== 77) {
            break;
          }

          message.certainty = reader.float();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.certaintyPresent = reader.bool();
          continue;
        case 11:
          if (tag !== 93) {
            break;
          }

          message.score = reader.float();
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.scorePresent = reader.bool();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.explainScore = reader.string();
          continue;
        case 14:
          if (tag !== 112) {
            break;
          }

          message.explainScorePresent = reader.bool();
          continue;
        case 15:
          if (tag !== 120) {
            break;
          }

          message.isConsistent = reader.bool();
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.generative = reader.string();
          continue;
        case 17:
          if (tag !== 136) {
            break;
          }

          message.generativePresent = reader.bool();
          continue;
        case 18:
          if (tag !== 144) {
            break;
          }

          message.isConsistentPresent = reader.bool();
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.vectorBytes = reader.bytes();
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.idBytes = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MetadataResult {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      vector: globalThis.Array.isArray(object?.vector) ? object.vector.map((e: any) => globalThis.Number(e)) : [],
      creationTimeUnix: isSet(object.creationTimeUnix) ? globalThis.Number(object.creationTimeUnix) : 0,
      creationTimeUnixPresent: isSet(object.creationTimeUnixPresent)
        ? globalThis.Boolean(object.creationTimeUnixPresent)
        : false,
      lastUpdateTimeUnix: isSet(object.lastUpdateTimeUnix) ? globalThis.Number(object.lastUpdateTimeUnix) : 0,
      lastUpdateTimeUnixPresent: isSet(object.lastUpdateTimeUnixPresent)
        ? globalThis.Boolean(object.lastUpdateTimeUnixPresent)
        : false,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : 0,
      distancePresent: isSet(object.distancePresent) ? globalThis.Boolean(object.distancePresent) : false,
      certainty: isSet(object.certainty) ? globalThis.Number(object.certainty) : 0,
      certaintyPresent: isSet(object.certaintyPresent) ? globalThis.Boolean(object.certaintyPresent) : false,
      score: isSet(object.score) ? globalThis.Number(object.score) : 0,
      scorePresent: isSet(object.scorePresent) ? globalThis.Boolean(object.scorePresent) : false,
      explainScore: isSet(object.explainScore) ? globalThis.String(object.explainScore) : "",
      explainScorePresent: isSet(object.explainScorePresent) ? globalThis.Boolean(object.explainScorePresent) : false,
      isConsistent: isSet(object.isConsistent) ? globalThis.Boolean(object.isConsistent) : undefined,
      generative: isSet(object.generative) ? globalThis.String(object.generative) : "",
      generativePresent: isSet(object.generativePresent) ? globalThis.Boolean(object.generativePresent) : false,
      isConsistentPresent: isSet(object.isConsistentPresent) ? globalThis.Boolean(object.isConsistentPresent) : false,
      vectorBytes: isSet(object.vectorBytes) ? bytesFromBase64(object.vectorBytes) : new Uint8Array(0),
      idBytes: isSet(object.idBytes) ? bytesFromBase64(object.idBytes) : new Uint8Array(0),
    };
  },

  toJSON(message: MetadataResult): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.vector?.length) {
      obj.vector = message.vector;
    }
    if (message.creationTimeUnix !== 0) {
      obj.creationTimeUnix = Math.round(message.creationTimeUnix);
    }
    if (message.creationTimeUnixPresent === true) {
      obj.creationTimeUnixPresent = message.creationTimeUnixPresent;
    }
    if (message.lastUpdateTimeUnix !== 0) {
      obj.lastUpdateTimeUnix = Math.round(message.lastUpdateTimeUnix);
    }
    if (message.lastUpdateTimeUnixPresent === true) {
      obj.lastUpdateTimeUnixPresent = message.lastUpdateTimeUnixPresent;
    }
    if (message.distance !== 0) {
      obj.distance = message.distance;
    }
    if (message.distancePresent === true) {
      obj.distancePresent = message.distancePresent;
    }
    if (message.certainty !== 0) {
      obj.certainty = message.certainty;
    }
    if (message.certaintyPresent === true) {
      obj.certaintyPresent = message.certaintyPresent;
    }
    if (message.score !== 0) {
      obj.score = message.score;
    }
    if (message.scorePresent === true) {
      obj.scorePresent = message.scorePresent;
    }
    if (message.explainScore !== "") {
      obj.explainScore = message.explainScore;
    }
    if (message.explainScorePresent === true) {
      obj.explainScorePresent = message.explainScorePresent;
    }
    if (message.isConsistent !== undefined) {
      obj.isConsistent = message.isConsistent;
    }
    if (message.generative !== "") {
      obj.generative = message.generative;
    }
    if (message.generativePresent === true) {
      obj.generativePresent = message.generativePresent;
    }
    if (message.isConsistentPresent === true) {
      obj.isConsistentPresent = message.isConsistentPresent;
    }
    if (message.vectorBytes.length !== 0) {
      obj.vectorBytes = base64FromBytes(message.vectorBytes);
    }
    if (message.idBytes.length !== 0) {
      obj.idBytes = base64FromBytes(message.idBytes);
    }
    return obj;
  },

  create(base?: DeepPartial<MetadataResult>): MetadataResult {
    return MetadataResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MetadataResult>): MetadataResult {
    const message = createBaseMetadataResult();
    message.id = object.id ?? "";
    message.vector = object.vector?.map((e) => e) || [];
    message.creationTimeUnix = object.creationTimeUnix ?? 0;
    message.creationTimeUnixPresent = object.creationTimeUnixPresent ?? false;
    message.lastUpdateTimeUnix = object.lastUpdateTimeUnix ?? 0;
    message.lastUpdateTimeUnixPresent = object.lastUpdateTimeUnixPresent ?? false;
    message.distance = object.distance ?? 0;
    message.distancePresent = object.distancePresent ?? false;
    message.certainty = object.certainty ?? 0;
    message.certaintyPresent = object.certaintyPresent ?? false;
    message.score = object.score ?? 0;
    message.scorePresent = object.scorePresent ?? false;
    message.explainScore = object.explainScore ?? "";
    message.explainScorePresent = object.explainScorePresent ?? false;
    message.isConsistent = object.isConsistent ?? undefined;
    message.generative = object.generative ?? "";
    message.generativePresent = object.generativePresent ?? false;
    message.isConsistentPresent = object.isConsistentPresent ?? false;
    message.vectorBytes = object.vectorBytes ?? new Uint8Array(0);
    message.idBytes = object.idBytes ?? new Uint8Array(0);
    return message;
  },
};

function createBasePropertiesResult(): PropertiesResult {
  return {
    nonRefProperties: undefined,
    refProps: [],
    targetCollection: "",
    metadata: undefined,
    numberArrayProperties: [],
    intArrayProperties: [],
    textArrayProperties: [],
    booleanArrayProperties: [],
    objectProperties: [],
    objectArrayProperties: [],
    nonRefProps: undefined,
  };
}

export const PropertiesResult = {
  encode(message: PropertiesResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonRefProperties !== undefined) {
      Struct.encode(Struct.wrap(message.nonRefProperties), writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.refProps) {
      RefPropertiesResult.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.targetCollection !== "") {
      writer.uint32(26).string(message.targetCollection);
    }
    if (message.metadata !== undefined) {
      MetadataResult.encode(message.metadata, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.numberArrayProperties) {
      NumberArrayProperties.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.intArrayProperties) {
      IntArrayProperties.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.textArrayProperties) {
      TextArrayProperties.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.booleanArrayProperties) {
      BooleanArrayProperties.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.objectProperties) {
      ObjectProperties.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.objectArrayProperties) {
      ObjectArrayProperties.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    if (message.nonRefProps !== undefined) {
      Properties.encode(message.nonRefProps, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PropertiesResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePropertiesResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.nonRefProperties = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.refProps.push(RefPropertiesResult.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.targetCollection = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.metadata = MetadataResult.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.numberArrayProperties.push(NumberArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.intArrayProperties.push(IntArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.textArrayProperties.push(TextArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.booleanArrayProperties.push(BooleanArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.objectProperties.push(ObjectProperties.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.objectArrayProperties.push(ObjectArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.nonRefProps = Properties.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PropertiesResult {
    return {
      nonRefProperties: isObject(object.nonRefProperties) ? object.nonRefProperties : undefined,
      refProps: globalThis.Array.isArray(object?.refProps)
        ? object.refProps.map((e: any) => RefPropertiesResult.fromJSON(e))
        : [],
      targetCollection: isSet(object.targetCollection) ? globalThis.String(object.targetCollection) : "",
      metadata: isSet(object.metadata) ? MetadataResult.fromJSON(object.metadata) : undefined,
      numberArrayProperties: globalThis.Array.isArray(object?.numberArrayProperties)
        ? object.numberArrayProperties.map((e: any) => NumberArrayProperties.fromJSON(e))
        : [],
      intArrayProperties: globalThis.Array.isArray(object?.intArrayProperties)
        ? object.intArrayProperties.map((e: any) => IntArrayProperties.fromJSON(e))
        : [],
      textArrayProperties: globalThis.Array.isArray(object?.textArrayProperties)
        ? object.textArrayProperties.map((e: any) => TextArrayProperties.fromJSON(e))
        : [],
      booleanArrayProperties: globalThis.Array.isArray(object?.booleanArrayProperties)
        ? object.booleanArrayProperties.map((e: any) => BooleanArrayProperties.fromJSON(e))
        : [],
      objectProperties: globalThis.Array.isArray(object?.objectProperties)
        ? object.objectProperties.map((e: any) => ObjectProperties.fromJSON(e))
        : [],
      objectArrayProperties: globalThis.Array.isArray(object?.objectArrayProperties)
        ? object.objectArrayProperties.map((e: any) => ObjectArrayProperties.fromJSON(e))
        : [],
      nonRefProps: isSet(object.nonRefProps) ? Properties.fromJSON(object.nonRefProps) : undefined,
    };
  },

  toJSON(message: PropertiesResult): unknown {
    const obj: any = {};
    if (message.nonRefProperties !== undefined) {
      obj.nonRefProperties = message.nonRefProperties;
    }
    if (message.refProps?.length) {
      obj.refProps = message.refProps.map((e) => RefPropertiesResult.toJSON(e));
    }
    if (message.targetCollection !== "") {
      obj.targetCollection = message.targetCollection;
    }
    if (message.metadata !== undefined) {
      obj.metadata = MetadataResult.toJSON(message.metadata);
    }
    if (message.numberArrayProperties?.length) {
      obj.numberArrayProperties = message.numberArrayProperties.map((e) => NumberArrayProperties.toJSON(e));
    }
    if (message.intArrayProperties?.length) {
      obj.intArrayProperties = message.intArrayProperties.map((e) => IntArrayProperties.toJSON(e));
    }
    if (message.textArrayProperties?.length) {
      obj.textArrayProperties = message.textArrayProperties.map((e) => TextArrayProperties.toJSON(e));
    }
    if (message.booleanArrayProperties?.length) {
      obj.booleanArrayProperties = message.booleanArrayProperties.map((e) => BooleanArrayProperties.toJSON(e));
    }
    if (message.objectProperties?.length) {
      obj.objectProperties = message.objectProperties.map((e) => ObjectProperties.toJSON(e));
    }
    if (message.objectArrayProperties?.length) {
      obj.objectArrayProperties = message.objectArrayProperties.map((e) => ObjectArrayProperties.toJSON(e));
    }
    if (message.nonRefProps !== undefined) {
      obj.nonRefProps = Properties.toJSON(message.nonRefProps);
    }
    return obj;
  },

  create(base?: DeepPartial<PropertiesResult>): PropertiesResult {
    return PropertiesResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PropertiesResult>): PropertiesResult {
    const message = createBasePropertiesResult();
    message.nonRefProperties = object.nonRefProperties ?? undefined;
    message.refProps = object.refProps?.map((e) => RefPropertiesResult.fromPartial(e)) || [];
    message.targetCollection = object.targetCollection ?? "";
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? MetadataResult.fromPartial(object.metadata)
      : undefined;
    message.numberArrayProperties = object.numberArrayProperties?.map((e) => NumberArrayProperties.fromPartial(e)) ||
      [];
    message.intArrayProperties = object.intArrayProperties?.map((e) => IntArrayProperties.fromPartial(e)) || [];
    message.textArrayProperties = object.textArrayProperties?.map((e) => TextArrayProperties.fromPartial(e)) || [];
    message.booleanArrayProperties = object.booleanArrayProperties?.map((e) => BooleanArrayProperties.fromPartial(e)) ||
      [];
    message.objectProperties = object.objectProperties?.map((e) => ObjectProperties.fromPartial(e)) || [];
    message.objectArrayProperties = object.objectArrayProperties?.map((e) => ObjectArrayProperties.fromPartial(e)) ||
      [];
    message.nonRefProps = (object.nonRefProps !== undefined && object.nonRefProps !== null)
      ? Properties.fromPartial(object.nonRefProps)
      : undefined;
    return message;
  },
};

function createBaseRefPropertiesResult(): RefPropertiesResult {
  return { properties: [], propName: "" };
}

export const RefPropertiesResult = {
  encode(message: RefPropertiesResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.properties) {
      PropertiesResult.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RefPropertiesResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRefPropertiesResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.properties.push(PropertiesResult.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.propName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RefPropertiesResult {
    return {
      properties: globalThis.Array.isArray(object?.properties)
        ? object.properties.map((e: any) => PropertiesResult.fromJSON(e))
        : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: RefPropertiesResult): unknown {
    const obj: any = {};
    if (message.properties?.length) {
      obj.properties = message.properties.map((e) => PropertiesResult.toJSON(e));
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<RefPropertiesResult>): RefPropertiesResult {
    return RefPropertiesResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RefPropertiesResult>): RefPropertiesResult {
    const message = createBaseRefPropertiesResult();
    message.properties = object.properties?.map((e) => PropertiesResult.fromPartial(e)) || [];
    message.propName = object.propName ?? "";
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
