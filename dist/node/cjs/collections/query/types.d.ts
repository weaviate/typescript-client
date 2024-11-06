/// <reference types="node" resolution-mode="require"/>
import { FilterValue } from '../filters/index.js';
import { MultiTargetVectorJoin } from '../index.js';
import { Sorting } from '../sort/classes.js';
import {
  GroupByOptions,
  GroupByReturn,
  QueryMetadata,
  QueryProperty,
  QueryReference,
  RerankOptions,
  WeaviateObject,
  WeaviateReturn,
} from '../types/index.js';
import { PrimitiveKeys } from '../types/internal.js';
/** Options available in the `query.fetchObjectById` method */
export type FetchObjectByIdOptions<T> = {
  /** Whether to include the vector of the object in the response. If using named vectors, pass an array of strings to include only specific vectors. */
  includeVector?: boolean | string[];
  /**
   * Which properties of the object to return. Can be primitive, in which case specify their names, or nested, in which case
   * use the QueryNested<T> type. If not specified, all properties are returned.
   */
  returnProperties?: QueryProperty<T>[];
  /** Which references of the object to return. If not specified, no references are returned. */
  returnReferences?: QueryReference<T>[];
};
/** Options available in the `query.fetchObjects` method */
export type FetchObjectsOptions<T> = {
  /** How many objects to return in the query */
  limit?: number;
  /** How many objects to skip in the query. Incompatible with the `after` cursor */
  offset?: number;
  /** The cursor to start the query from. Incompatible with the `offset` param */
  after?: string;
  /** The filters to be applied to the query. Use `weaviate.filter.*` to create filters */
  filters?: FilterValue;
  /** The sorting to be applied to the query. Use `weaviate.sort.*` to create sorting */
  sort?: Sorting<T>;
  /** Whether to include the vector of the object in the response. If using named vectors, pass an array of strings to include only specific vectors. */
  includeVector?: boolean | string[];
  /** Which metadata of the object to return. If not specified, no metadata is returned. */
  returnMetadata?: QueryMetadata;
  /**
   * Which properties of the object to return. Can be primitive, in which case specify their names, or nested, in which case
   * use the QueryNested<T> type. If not specified, all properties are returned.
   */
  returnProperties?: QueryProperty<T>[];
  /** Which references of the object to return. If not specified, no references are returned. */
  returnReferences?: QueryReference<T>[];
};
/** Base options available to all the query methods that involve searching. */
export type SearchOptions<T> = {
  /** How many objects to return in the query */
  limit?: number;
  /** How many objects to skip in the query. Incompatible with the `after` cursor */
  offset?: number;
  /** The [autocut](https://weaviate.io/developers/weaviate/api/graphql/additional-operators#autocut) parameter */
  autoLimit?: number;
  /** The filters to be applied to the query. Use `weaviate.filter.*` to create filters */
  filters?: FilterValue;
  /** How to rerank the query results. Requires a configured [reranking](https://weaviate.io/developers/weaviate/concepts/reranking) module. */
  rerank?: RerankOptions<T>;
  /** Whether to include the vector of the object in the response. If using named vectors, pass an array of strings to include only specific vectors. */
  includeVector?: boolean | string[];
  /** Which metadata of the object to return. If not specified, no metadata is returned. */
  returnMetadata?: QueryMetadata;
  /**
   * Which properties of the object to return. Can be primitive, in which case specify their names, or nested, in which case
   * use the QueryNested<T> type. If not specified, all properties are returned.
   */
  returnProperties?: QueryProperty<T>[];
  /** Which references of the object to return. If not specified, no references are returned. */
  returnReferences?: QueryReference<T>[];
};
/** Which property of the collection to perform the keyword search on. */
export type Bm25QueryProperty<T> = {
  /** The property name to search on. */
  name: PrimitiveKeys<T>;
  /** The weight to provide to the keyword search for this property. */
  weight: number;
};
/** Base options available in the `query.bm25` method */
export type BaseBm25Options<T> = SearchOptions<T> & {
  /** Which properties of the collection to perform the keyword search on. */
  queryProperties?: (PrimitiveKeys<T> | Bm25QueryProperty<T>)[];
};
/** Options available in the `query.bm25` method when specifying the `groupBy` parameter. */
export type GroupByBm25Options<T> = BaseBm25Options<T> & {
  /** The group by options to apply to the search. */
  groupBy: GroupByOptions<T>;
};
/** Options available in the `query.bm25` method */
export type Bm25Options<T> = BaseBm25Options<T> | GroupByBm25Options<T> | undefined;
/** Base options available in the `query.hybrid` method */
export type BaseHybridOptions<T> = SearchOptions<T> & {
  /** The weight of the BM25 score. If not specified, the default weight specified by the server is used. */
  alpha?: number;
  /** The specific vector to search for or a specific vector subsearch. If not specified, the query is vectorized and used in the similarity search. */
  vector?: NearVectorInputType | HybridNearTextSubSearch | HybridNearVectorSubSearch;
  /** The properties to search in. If not specified, all properties are searched. */
  queryProperties?: (PrimitiveKeys<T> | Bm25QueryProperty<T>)[];
  /** The type of fusion to apply. If not specified, the default fusion type specified by the server is used. */
  fusionType?: 'Ranked' | 'RelativeScore';
  /** Specify which vector(s) to search on if using named vectors. */
  targetVector?: TargetVectorInputType;
};
export type HybridSubSearchBase = {
  certainty?: number;
  distance?: number;
};
export type HybridNearTextSubSearch = HybridSubSearchBase & {
  query: string | string[];
  moveTo?: MoveOptions;
  moveAway?: MoveOptions;
};
export type HybridNearVectorSubSearch = HybridSubSearchBase & {
  vector: NearVectorInputType;
};
/** Options available in the `query.hybrid` method when specifying the `groupBy` parameter. */
export type GroupByHybridOptions<T> = BaseHybridOptions<T> & {
  /** The group by options to apply to the search. */
  groupBy: GroupByOptions<T>;
};
/** Options available in the `query.hybrid` method */
export type HybridOptions<T> = BaseHybridOptions<T> | GroupByHybridOptions<T> | undefined;
/** Base options for the near search queries. */
export type BaseNearOptions<T> = SearchOptions<T> & {
  /** The minimum similarity score to return. Incompatible with the `distance` param. */
  certainty?: number;
  /** The maximum distance to search. Incompatible with the `certainty` param. */
  distance?: number;
  /** Specify which vector to search on if using named vectors. */
  targetVector?: TargetVectorInputType;
};
/** Options available in the near search queries when specifying the `groupBy` parameter. */
export type GroupByNearOptions<T> = BaseNearOptions<T> & {
  /** The group by options to apply to the search. */
  groupBy: GroupByOptions<T>;
};
/** Options available when specifying `moveTo` and `moveAway` in the `query.nearText` method. */
export type MoveOptions = {
  force: number;
  objects?: string[];
  concepts?: string[];
};
/** Base options for the `query.nearText` method. */
export type BaseNearTextOptions<T> = BaseNearOptions<T> & {
  moveTo?: MoveOptions;
  moveAway?: MoveOptions;
};
/** Options available in the near text search queries when specifying the `groupBy` parameter. */
export type GroupByNearTextOptions<T> = BaseNearTextOptions<T> & {
  groupBy: GroupByOptions<T>;
};
/** The type of the media to search for in the `query.nearMedia` method */
export type NearMediaType = 'audio' | 'depth' | 'image' | 'imu' | 'thermal' | 'video';
/**
 * The vector(s) to search for in the `query/generate.nearVector` and `query/generate.hybrid` methods. One of:
 * - a single vector, in which case pass a single number array.
 * - multiple named vectors, in which case pass an object of type `Record<string, number[] | number[][]>`.
 */
export type NearVectorInputType = number[] | Record<string, number[] | number[][]>;
/**
 * Over which vector spaces to perform the vector search query in the `nearX` search method. One of:
 * - a single vector space search, in which case pass a string with the name of the vector space to search in.
 * - a multi-vector space search, in which case pass an array of strings with the names of the vector spaces to search in.
 * - a weighted multi-vector space search, in which case pass an object of type `MultiTargetVectorJoin` detailing the vector spaces to search in.
 */
export type TargetVectorInputType = string | string[] | MultiTargetVectorJoin;
interface Bm25<T> {
  /**
   * Search for objects in this collection using the keyword-based BM25 algorithm.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {BaseBm25Options<T>} [opts] - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The result of the search within the fetched collection.
   */
  bm25(query: string, opts?: BaseBm25Options<T>): Promise<WeaviateReturn<T>>;
  /**
   * Search for objects in this collection using the keyword-based BM25 algorithm.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GroupByBm25Options<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The result of the search within the fetched collection.
   */
  bm25(query: string, opts: GroupByBm25Options<T>): Promise<GroupByReturn<T>>;
  /**
   * Search for objects in this collection using the keyword-based BM25 algorithm.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} query - The query to search for.
   * @param {Bm25Options<T>} [opts] - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The result of the search within the fetched collection.
   */
  bm25(query: string, opts?: Bm25Options<T>): QueryReturn<T>;
}
interface Hybrid<T> {
  /**
   * Search for objects in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} query - The query to search for in the BM25 keyword search..
   * @param {BaseHybridOptions<T>} [opts] - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The result of the search within the fetched collection.
   */
  hybrid(query: string, opts?: BaseHybridOptions<T>): Promise<WeaviateReturn<T>>;
  /**
   * Search for objects in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} query - The query to search for in the BM25 keyword search..
   * @param {GroupByHybridOptions<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The result of the search within the fetched collection.
   */
  hybrid(query: string, opts: GroupByHybridOptions<T>): Promise<GroupByReturn<T>>;
  /**
   * Search for objects in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} query - The query to search for in the BM25 keyword search..
   * @param {HybridOptions<T>} [opts] - The available options for the search including the `groupBy` param.
   * @returns {Promise<QueryReturn<T>>} - The result of the search within the fetched collection.
   */
  hybrid(query: string, opts?: HybridOptions<T>): QueryReturn<T>;
}
interface NearImage<T> {
  /**
   * Search for objects by image in this collection using an image-capable vectorization module and vector-based similarity search.
   * You must have an image-capable vectorization module installed in order to use this method,
   * e.g. `img2vec-neural`, `multi2vec-clip`, or `multi2vec-bind.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/image) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string | Buffer} image - The image to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {BaseNearOptions<T>} [opts] - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The result of the search within the fetched collection.
   */
  nearImage(image: string | Buffer, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  /**
   * Search for objects by image in this collection using an image-capable vectorization module and vector-based similarity search.
   * You must have an image-capable vectorization module installed in order to use this method,
   * e.g. `img2vec-neural`, `multi2vec-clip`, or `multi2vec-bind.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string | Buffer} image - The image to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {GroupByNearOptions<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The group by result of the search within the fetched collection.
   */
  nearImage(image: string | Buffer, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  /**
   * Search for objects by image in this collection using an image-capable vectorization module and vector-based similarity search.
   * You must have an image-capable vectorization module installed in order to use this method,
   * e.g. `img2vec-neural`, `multi2vec-clip`, or `multi2vec-bind.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string | Buffer} image - The image to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {NearOptions<T>} [opts] - The available options for the search.
   * @returns {QueryReturn<T>} - The result of the search within the fetched collection.
   */
  nearImage(image: string | Buffer, opts?: NearOptions<T>): QueryReturn<T>;
}
interface NearMedia<T> {
  /**
   * Search for objects by image in this collection using an image-capable vectorization module and vector-based similarity search.
   * You must have a multi-media-capable vectorization module installed in order to use this method, e.g. `multi2vec-bind` or `multi2vec-palm`.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string | Buffer} media - The media to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {NearMediaType} type - The type of media to search for, e.g. 'audio'.
   * @param {BaseNearOptions<T>} [opts] - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The result of the search within the fetched collection.
   */
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts?: BaseNearOptions<T>
  ): Promise<WeaviateReturn<T>>;
  /**
   * Search for objects by image in this collection using an image-capable vectorization module and vector-based similarity search.
   * You must have a multi-media-capable vectorization module installed in order to use this method, e.g. `multi2vec-bind` or `multi2vec-palm`.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string | Buffer} media - The media to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {NearMediaType} type - The type of media to search for, e.g. 'audio'.
   * @param {GroupByNearOptions<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The group by result of the search within the fetched collection.
   */
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts: GroupByNearOptions<T>
  ): Promise<GroupByReturn<T>>;
  /**
   * Search for objects by image in this collection using an image-capable vectorization module and vector-based similarity search.
   * You must have a multi-media-capable vectorization module installed in order to use this method, e.g. `multi2vec-bind` or `multi2vec-palm`.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string | Buffer} media - The media to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {NearMediaType} type - The type of media to search for, e.g. 'audio'.
   * @param {NearOptions<T>} [opts] - The available options for the search.
   * @returns {QueryReturn<T>} - The result of the search within the fetched collection.
   */
  nearMedia(media: string | Buffer, type: NearMediaType, opts?: NearOptions<T>): QueryReturn<T>;
}
interface NearObject<T> {
  /**
   * Search for objects in this collection by another object using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} id - The UUID of the object to search for.
   * @param {BaseNearOptions<T>} [opts] - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The result of the search within the fetched collection.
   */
  nearObject(id: string, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  /**
   * Search for objects in this collection by another object using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} id - The UUID of the object to search for.
   * @param {GroupByNearOptions<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The group by result of the search within the fetched collection.
   */
  nearObject(id: string, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  /**
   * Search for objects in this collection by another object using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {number[]} id - The UUID of the object to search for.
   * @param {NearOptions<T>} [opts] - The available options for the search.
   * @returns {QueryReturn<T>} - The result of the search within the fetched collection.
   */
  nearObject(id: string, opts?: NearOptions<T>): QueryReturn<T>;
}
interface NearText<T> {
  /**
   * Search for objects in this collection by text using text-capable vectorization module and vector-based similarity search.
   * You must have a text-capable vectorization module installed in order to use this method,
   * e.g. any of the `text2vec-` and `multi2vec-` modules.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#neartext) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string | string[]} query - The text query to search for.
   * @param {BaseNearTextOptions<T>} [opts] - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The result of the search within the fetched collection.
   */
  nearText(query: string | string[], opts?: BaseNearTextOptions<T>): Promise<WeaviateReturn<T>>;
  /**
   * Search for objects in this collection by text using text-capable vectorization module and vector-based similarity search.
   * You must have a text-capable vectorization module installed in order to use this method,
   * e.g. any of the `text2vec-` and `multi2vec-` modules.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#neartext) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string | string[]} query - The text query to search for.
   * @param {GroupByNearTextOptions<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The group by result of the search within the fetched collection.
   */
  nearText(query: string | string[], opts: GroupByNearTextOptions<T>): Promise<GroupByReturn<T>>;
  /**
   * Search for objects in this collection by text using text-capable vectorization module and vector-based similarity search.
   * You must have a text-capable vectorization module installed in order to use this method,
   * e.g. any of the `text2vec-` and `multi2vec-` modules.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#neartext) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string | string[]} query - The text query to search for.
   * @param {NearTextOptions<T>} [opts] - The available options for the search.
   * @returns {QueryReturn<T>} - The result of the search within the fetched collection.
   */
  nearText(query: string | string[], opts?: NearTextOptions<T>): QueryReturn<T>;
}
interface NearVector<T> {
  /**
   * Search for objects by vector in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search on.
   * @param {BaseNearOptions<T>} [opts] - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The result of the search within the fetched collection.
   */
  nearVector(vector: NearVectorInputType, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  /**
   * Search for objects by vector in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {GroupByNearOptions<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The group by result of the search within the fetched collection.
   */
  nearVector(vector: NearVectorInputType, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  /**
   * Search for objects by vector in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {NearOptions<T>} [opts] - The available options for the search.
   * @returns {QueryReturn<T>} - The result of the search within the fetched collection.
   */
  nearVector(vector: NearVectorInputType, opts?: NearOptions<T>): QueryReturn<T>;
}
/** All the available methods on the `.query` namespace. */
export interface Query<T>
  extends Bm25<T>,
    Hybrid<T>,
    NearImage<T>,
    NearMedia<T>,
    NearObject<T>,
    NearText<T>,
    NearVector<T> {
  /**
   * Retrieve an object from the server by its UUID.
   *
   * @param {string} id - The UUID of the object to retrieve.
   * @param {FetchObjectByIdOptions} [opts] - The available options for fetching the object.
   * @returns {Promise<WeaviateObject<T> | null>} - The object with the given UUID, or null if it does not exist.
   */
  fetchObjectById: (id: string, opts?: FetchObjectByIdOptions<T>) => Promise<WeaviateObject<T> | null>;
  /**
   * Retrieve objects from the server without searching.
   *
   * @param {FetchObjectsOptions} [opts] - The available options for fetching the objects.
   * @returns {Promise<WeaviateReturn<T>>} - The objects within the fetched collection.
   */
  fetchObjects: (opts?: FetchObjectsOptions<T>) => Promise<WeaviateReturn<T>>;
}
/** Options available in the `query.nearImage`, `query.nearMedia`, `query.nearObject`, and `query.nearVector` methods */
export type NearOptions<T> = BaseNearOptions<T> | GroupByNearOptions<T> | undefined;
/** Options available in the `query.nearText` method */
export type NearTextOptions<T> = BaseNearTextOptions<T> | GroupByNearTextOptions<T> | undefined;
/** The return type of the `query` methods. It is a union of a standard query and a group by query due to function overloading. */
export type QueryReturn<T> = Promise<WeaviateReturn<T>> | Promise<GroupByReturn<T>>;
export {};
