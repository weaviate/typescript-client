import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  BaseNearTextOptions,
  Bm25Options,
  FetchObjectsOptions,
  GroupByBm25Options,
  GroupByHybridOptions,
  GroupByNearOptions,
  GroupByNearTextOptions,
  HybridOptions,
  NearMediaType,
  NearOptions,
  NearTextOptions,
  NearVectorInputType,
} from '../query/types.js';
import {
  GenerateOptions,
  GenerateReturn,
  GenerativeGroupByReturn,
  GenerativeReturn,
} from '../types/index.js';

interface Bm25<T, V> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a keyword-based BM25 search of objects in this collection.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {BaseBm25Options<T, V>} [opts] - The available options for performing the BM25 search.
   * @return {Promise<GenerativeReturn<T, V>>} - The results of the search including the generated data.
   */
  bm25(
    query: string,
    generate: GenerateOptions<T>,
    opts?: BaseBm25Options<T, V>
  ): Promise<GenerativeReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a keyword-based BM25 search of objects in this collection.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {GroupByBm25Options<T, V>} opts - The available options for performing the BM25 search.
   * @return {Promise<GenerativeGroupByReturn<T, V>>} - The results of the search including the generated data grouped by the specified properties.
   */
  bm25(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByBm25Options<T, V>
  ): Promise<GenerativeGroupByReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a keyword-based BM25 search of objects in this collection.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {Bm25Options<T, V>} [opts] - The available options for performing the BM25 search.
   * @return {GenerateReturn<T, V>} - The results of the search including the generated data.
   */
  bm25(query: string, generate: GenerateOptions<T>, opts?: Bm25Options<T, V>): GenerateReturn<T, V>;
}

interface Hybrid<T, V> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of an object search in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {BaseHybridOptions<T, V>} [opts] - The available options for performing the hybrid search.
   * @return {Promise<GenerativeReturn<T, V>>} - The results of the search including the generated data.
   */
  hybrid(
    query: string,
    generate: GenerateOptions<T>,
    opts?: BaseHybridOptions<T, V>
  ): Promise<GenerativeReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of an object search in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {GroupByHybridOptions<T, V>} opts - The available options for performing the hybrid search.
   * @return {Promise<GenerativeGroupByReturn<T, V>>} - The results of the search including the generated data grouped by the specified properties.
   */
  hybrid(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByHybridOptions<T, V>
  ): Promise<GenerativeGroupByReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of an object search in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {HybridOptions<T, V>} [opts] - The available options for performing the hybrid search.
   * @return {GenerateReturn<T, V>} - The results of the search including the generated data.
   */
  hybrid(query: string, generate: GenerateOptions<T>, opts?: HybridOptions<T, V>): GenerateReturn<T, V>;
}

interface NearMedia<T, V> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-audio object search in this collection using an audio-capable vectorization module and vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for a more detailed explanation.
   *
   * NOTE: You must have a multi-media-capable vectorization module installed in order to use this method, e.g. `multi2vec-bind`.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string | Buffer} media - The media file to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {NearMediaType} type - The type of media to search on.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {BaseNearOptions<T, V>} [opts] - The available options for performing the near-media search.
   * @return {Promise<GenerativeReturn<T, V>>} - The results of the search including the generated data.
   */
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T, V>
  ): Promise<GenerativeReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-audio object search in this collection using an audio-capable vectorization module and vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for a more detailed explanation.
   *
   * NOTE: You must have a multi-media-capable vectorization module installed in order to use this method, e.g. `multi2vec-bind`.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string | Buffer} media - The media file to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {NearMediaType} type - The type of media to search on.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {GroupByNearOptions<T, V>} opts - The available options for performing the near-media search.
   * @return {Promise<GenerativeGroupByReturn<T, V>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T, V>
  ): Promise<GenerativeGroupByReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-audio object search in this collection using an audio-capable vectorization module and vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for a more detailed explanation.
   *
   * NOTE: You must have a multi-media-capable vectorization module installed in order to use this method, e.g. `multi2vec-bind`.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string | Buffer} media - The media to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {NearMediaType} type - The type of media to search on.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {NearOptions<T, V>} [opts] - The available options for performing the near-media search.
   * @return {GenerateReturn<T, V>} - The results of the search including the generated data.
   */
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T, V>
  ): GenerateReturn<T, V>;
}

interface NearObject<T, V> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-object object search in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} id - The ID of the object to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {BaseNearOptions<T, V>} [opts] - The available options for performing the near-object search.
   * @return {Promise<GenerativeReturn<T, V>>} - The results of the search including the generated data.
   */
  nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T, V>
  ): Promise<GenerativeReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-object object search in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} id - The ID of the object to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {GroupByNearOptions<T, V>} opts - The available options for performing the near-object search.
   * @return {Promise<GenerativeGroupByReturn<T, V>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T, V>
  ): Promise<GenerativeGroupByReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-object object search in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} id - The ID of the object to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {NearOptions<T, V>} [opts] - The available options for performing the near-object search.
   * @return {GenerateReturn<T, V>} - The results of the search including the generated data.
   */
  nearObject(id: string, generate: GenerateOptions<T>, opts?: NearOptions<T, V>): GenerateReturn<T, V>;
}

interface NearText<T, V> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-image object search in this collection using the image-capable vectorization module and vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#neartext) for a more detailed explanation.
   *
   * NOTE: You must have a text-capable vectorization module installed in order to use this method, e.g. any of the `text2vec-` and `multi2vec-` modules.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string | string[]} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {BaseNearTextOptions<T, V>} [opts] - The available options for performing the near-text search.
   * @return {Promise<GenerativeReturn<T, V>>} - The results of the search including the generated data.
   */
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: BaseNearTextOptions<T, V>
  ): Promise<GenerativeReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-image object search in this collection using the image-capable vectorization module and vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#neartext) for a more detailed explanation.
   *
   * NOTE: You must have a text-capable vectorization module installed in order to use this method, e.g. any of the `text2vec-` and `multi2vec-` modules.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string | string[]} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {GroupByNearTextOptions<T, V>} opts - The available options for performing the near-text search.
   * @return {Promise<GenerativeGroupByReturn<T, V>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts: GroupByNearTextOptions<T, V>
  ): Promise<GenerativeGroupByReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-image object search in this collection using the image-capable vectorization module and vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#neartext) for a more detailed explanation.
   *
   * NOTE: You must have a text-capable vectorization module installed in order to use this method, e.g. any of the `text2vec-` and `multi2vec-` modules.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string | string[]} query - The query to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {NearTextOptions<T, V>} [opts] - The available options for performing the near-text search.
   * @return {GenerateReturn<T, V>} - The results of the search including the generated data.
   */
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: NearTextOptions<T, V>
  ): GenerateReturn<T, V>;
}

interface NearVector<T, V> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-vector object search in this collection using vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {BaseNearOptions<T, V>} [opts] - The available options for performing the near-vector search.
   * @return {Promise<GenerativeReturn<T, V>>} - The results of the search including the generated data.
   */
  nearVector(
    vector: NearVectorInputType,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T, V>
  ): Promise<GenerativeReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-vector object search in this collection using vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {GroupByNearOptions<T, V>} opts - The available options for performing the near-vector search.
   * @return {Promise<GenerativeGroupByReturn<T, V>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearVector(
    vector: NearVectorInputType,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T, V>
  ): Promise<GenerativeGroupByReturn<T, V>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-vector object search in this collection using vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {GenerateOptions<T>} generate - The available options for performing the generation.
   * @param {NearOptions<T, V>} [opts] - The available options for performing the near-vector search.
   * @return {GenerateReturn<T, V>} - The results of the search including the generated data.
   */
  nearVector(
    vector: NearVectorInputType,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T, V>
  ): GenerateReturn<T, V>;
}

export interface Generate<T, V>
  extends Bm25<T, V>,
    Hybrid<T, V>,
    NearMedia<T, V>,
    NearObject<T, V>,
    NearText<T, V>,
    NearVector<T, V> {
  fetchObjects: (
    generate: GenerateOptions<T>,
    opts?: FetchObjectsOptions<T, V>
  ) => Promise<GenerativeReturn<T, V>>;
}
