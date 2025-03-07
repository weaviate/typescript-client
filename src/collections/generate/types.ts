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
  GenerativeConfigRuntime,
  GenerativeGroupByReturn,
  GenerativeReturn,
} from '../types/index.js';

interface Bm25<T> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a keyword-based BM25 search of objects in this collection.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {BaseBm25Options<T>} [opts] - The available options for performing the BM25 search.
   * @return {Promise<GenerativeReturn<T, C>>} - The results of the search including the generated data.
   */
  bm25<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseBm25Options<T>
  ): Promise<GenerativeReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a keyword-based BM25 search of objects in this collection.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {GroupByBm25Options<T>} opts - The available options for performing the BM25 search.
   * @return {Promise<GenerativeGroupByReturn<T, C>>} - The results of the search including the generated data grouped by the specified properties.
   */
  bm25<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByBm25Options<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a keyword-based BM25 search of objects in this collection.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/bm25) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {Bm25Options<T>} [opts] - The available options for performing the BM25 search.
   * @return {GenerateReturn<T, C>} - The results of the search including the generated data.
   */
  bm25<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: Bm25Options<T>
  ): GenerateReturn<T, C>;
}

interface Hybrid<T> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of an object search in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {BaseHybridOptions<T>} [opts] - The available options for performing the hybrid search.
   * @return {Promise<GenerativeReturn<T, C>>} - The results of the search including the generated data.
   */
  hybrid<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseHybridOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of an object search in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {GroupByHybridOptions<T>} opts - The available options for performing the hybrid search.
   * @return {Promise<GenerativeGroupByReturn<T, C>>} - The results of the search including the generated data grouped by the specified properties.
   */
  hybrid<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByHybridOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of an object search in this collection using the hybrid algorithm blending keyword-based BM25 and vector-based similarity.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/hybrid) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} query - The query to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {HybridOptions<T>} [opts] - The available options for performing the hybrid search.
   * @return {GenerateReturn<T, C>} - The results of the search including the generated data.
   */
  hybrid<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: HybridOptions<T>
  ): GenerateReturn<T, C>;
}

interface NearMedia<T> {
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
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {BaseNearOptions<T>} [opts] - The available options for performing the near-media search.
   * @return {Promise<GenerativeReturn<T, C>>} - The results of the search including the generated data.
   */
  nearMedia<C extends GenerativeConfigRuntime | undefined = undefined>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
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
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {GroupByNearOptions<T>} opts - The available options for performing the near-media search.
   * @return {Promise<GenerativeGroupByReturn<T, C>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearMedia<C extends GenerativeConfigRuntime | undefined = undefined>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
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
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {NearOptions<T>} [opts] - The available options for performing the near-media search.
   * @return {GenerateReturn<T, C>} - The results of the search including the generated data.
   */
  nearMedia<C extends GenerativeConfigRuntime | undefined = undefined>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C>;
}

interface NearObject<T> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-object object search in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {string} id - The ID of the object to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {BaseNearOptions<T>} [opts] - The available options for performing the near-object search.
   * @return {Promise<GenerativeReturn<T, C>>} - The results of the search including the generated data.
   */
  nearObject<C extends GenerativeConfigRuntime | undefined = undefined>(
    id: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-object object search in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {string} id - The ID of the object to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {GroupByNearOptions<T>} opts - The available options for performing the near-object search.
   * @return {Promise<GenerativeGroupByReturn<T, C>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearObject<C extends GenerativeConfigRuntime | undefined = undefined>(
    id: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-object object search in this collection using a vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/api/graphql/search-operators#nearobject) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {string} id - The ID of the object to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {NearOptions<T>} [opts] - The available options for performing the near-object search.
   * @return {GenerateReturn<T, C>} - The results of the search including the generated data.
   */
  nearObject<C extends GenerativeConfigRuntime | undefined = undefined>(
    id: string,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C>;
}

interface NearText<T> {
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
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {BaseNearTextOptions<T>} [opts] - The available options for performing the near-text search.
   * @return {Promise<GenerativeReturn<T, C>>} - The results of the search including the generated data.
   */
  nearText<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts?: BaseNearTextOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
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
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {GroupByNearTextOptions<T>} opts - The available options for performing the near-text search.
   * @return {Promise<GenerativeGroupByReturn<T, C>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearText<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts: GroupByNearTextOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
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
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {NearTextOptions<T>} [opts] - The available options for performing the near-text search.
   * @return {GenerateReturn<T, C>} - The results of the search including the generated data.
   */
  nearText<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts?: NearTextOptions<T>
  ): GenerateReturn<T, C>;
}

interface NearVector<T> {
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-vector object search in this collection using vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search without the `groupBy` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {BaseNearOptions<T>} [opts] - The available options for performing the near-vector search.
   * @return {Promise<GenerativeReturn<T, C>>} - The results of the search including the generated data.
   */
  nearVector<C extends GenerativeConfigRuntime | undefined = undefined>(
    vector: NearVectorInputType,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-vector object search in this collection using vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with the `groupBy` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {GroupByNearOptions<T>} opts - The available options for performing the near-vector search.
   * @return {Promise<GenerativeGroupByReturn<T, C>>} - The results of the search including the generated data grouped by the specified properties.
   */
  nearVector<C extends GenerativeConfigRuntime | undefined = undefined>(
    vector: NearVectorInputType,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  /**
   * Perform retrieval-augmented generation (RaG) on the results of a by-vector object search in this collection using vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * This overload is for performing a search with a programmatically defined `opts` param.
   *
   * @param {NearVectorInputType} vector - The vector(s) to search for.
   * @param {GenerateOptions<T, C>} generate - The available options for performing the generation.
   * @param {NearOptions<T>} [opts] - The available options for performing the near-vector search.
   * @return {GenerateReturn<T, C>} - The results of the search including the generated data.
   */
  nearVector<C extends GenerativeConfigRuntime | undefined = undefined>(
    vector: NearVectorInputType,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C>;
}

export interface Generate<T>
  extends Bm25<T>,
    Hybrid<T>,
    NearMedia<T>,
    NearObject<T>,
    NearText<T>,
    NearVector<T> {
  fetchObjects: <C extends GenerativeConfigRuntime | undefined = undefined>(
    generate: GenerateOptions<T, C>,
    opts?: FetchObjectsOptions<T>
  ) => Promise<GenerativeReturn<T, C>>;
}
