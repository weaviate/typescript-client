'use strict';
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.vectorizer = void 0;
const makeVectorizer = (name, options) => {
  return {
    name: name,
    properties: options === null || options === void 0 ? void 0 : options.sourceProperties,
    vectorIndex: (options === null || options === void 0 ? void 0 : options.vectorIndexConfig)
      ? options.vectorIndexConfig
      : { name: 'hnsw', config: undefined },
    vectorizer: (options === null || options === void 0 ? void 0 : options.vectorizerConfig)
      ? options.vectorizerConfig
      : { name: 'none', config: undefined },
  };
};
const mapMulti2VecField = (field) => {
  if (typeof field === 'string') {
    return { name: field };
  }
  return field;
};
const formatMulti2VecFields = (weights, key, fields) => {
  if (fields !== undefined && fields.length > 0) {
    weights[key] = fields.filter((f) => f.weight !== undefined).map((f) => f.weight);
    if (weights[key].length === 0) {
      delete weights[key];
    }
  }
  return weights;
};
exports.vectorizer = {
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'none'`.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'none'>} [opts] The configuration options for the `none` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'none'>} The configuration object.
   */
  none: (opts) => {
    const { name, vectorIndexConfig } = opts || {};
    return makeVectorizer(name, { vectorIndexConfig });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'img2vec-neural'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/img2vec-neural) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'img2vec-neural'>} [opts] The configuration options for the `img2vec-neural` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'img2vec-neural'>} The configuration object.
   */
  img2VecNeural: (opts) => {
    const { name, vectorIndexConfig } = opts,
      config = __rest(opts, ['name', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'img2vec-neural',
        config: config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-bind'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/imagebind/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-bind'>} [opts] The configuration options for the `multi2vec-bind` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-bind'>} The configuration object.
   */
  multi2VecBind: (opts) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const _h = opts || {},
      { name, vectorIndexConfig } = _h,
      config = __rest(_h, ['name', 'vectorIndexConfig']);
    const audioFields =
      (_a = config.audioFields) === null || _a === void 0 ? void 0 : _a.map(mapMulti2VecField);
    const depthFields =
      (_b = config.depthFields) === null || _b === void 0 ? void 0 : _b.map(mapMulti2VecField);
    const imageFields =
      (_c = config.imageFields) === null || _c === void 0 ? void 0 : _c.map(mapMulti2VecField);
    const IMUFields = (_d = config.IMUFields) === null || _d === void 0 ? void 0 : _d.map(mapMulti2VecField);
    const textFields =
      (_e = config.textFields) === null || _e === void 0 ? void 0 : _e.map(mapMulti2VecField);
    const thermalFields =
      (_f = config.thermalFields) === null || _f === void 0 ? void 0 : _f.map(mapMulti2VecField);
    const videoFields =
      (_g = config.videoFields) === null || _g === void 0 ? void 0 : _g.map(mapMulti2VecField);
    let weights = {};
    weights = formatMulti2VecFields(weights, 'audioFields', audioFields);
    weights = formatMulti2VecFields(weights, 'depthFields', depthFields);
    weights = formatMulti2VecFields(weights, 'imageFields', imageFields);
    weights = formatMulti2VecFields(weights, 'IMUFields', IMUFields);
    weights = formatMulti2VecFields(weights, 'textFields', textFields);
    weights = formatMulti2VecFields(weights, 'thermalFields', thermalFields);
    weights = formatMulti2VecFields(weights, 'videoFields', videoFields);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-bind',
        config:
          Object.keys(config).length === 0
            ? undefined
            : Object.assign(Object.assign({}, config), {
                audioFields:
                  audioFields === null || audioFields === void 0 ? void 0 : audioFields.map((f) => f.name),
                depthFields:
                  depthFields === null || depthFields === void 0 ? void 0 : depthFields.map((f) => f.name),
                imageFields:
                  imageFields === null || imageFields === void 0 ? void 0 : imageFields.map((f) => f.name),
                IMUFields: IMUFields === null || IMUFields === void 0 ? void 0 : IMUFields.map((f) => f.name),
                textFields:
                  textFields === null || textFields === void 0 ? void 0 : textFields.map((f) => f.name),
                thermalFields:
                  thermalFields === null || thermalFields === void 0
                    ? void 0
                    : thermalFields.map((f) => f.name),
                videoFields:
                  videoFields === null || videoFields === void 0 ? void 0 : videoFields.map((f) => f.name),
                weights: Object.keys(weights).length === 0 ? undefined : weights,
              }),
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-clip'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/transformers/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-clip'>} [opts] The configuration options for the `multi2vec-clip` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-clip'>} The configuration object.
   */
  multi2VecClip: (opts) => {
    var _a, _b;
    const _c = opts || {},
      { name, vectorIndexConfig } = _c,
      config = __rest(_c, ['name', 'vectorIndexConfig']);
    const imageFields =
      (_a = config.imageFields) === null || _a === void 0 ? void 0 : _a.map(mapMulti2VecField);
    const textFields =
      (_b = config.textFields) === null || _b === void 0 ? void 0 : _b.map(mapMulti2VecField);
    let weights = {};
    weights = formatMulti2VecFields(weights, 'imageFields', imageFields);
    weights = formatMulti2VecFields(weights, 'textFields', textFields);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-clip',
        config:
          Object.keys(config).length === 0
            ? undefined
            : Object.assign(Object.assign({}, config), {
                imageFields:
                  imageFields === null || imageFields === void 0 ? void 0 : imageFields.map((f) => f.name),
                textFields:
                  textFields === null || textFields === void 0 ? void 0 : textFields.map((f) => f.name),
                weights: Object.keys(weights).length === 0 ? undefined : weights,
              }),
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-palm'>} opts The configuration options for the `multi2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-palm'>} The configuration object.
   * @deprecated Use `multi2VecGoogle` instead.
   */
  multi2VecPalm: (opts) => {
    var _a, _b, _c;
    console.warn('The `multi2vec-palm` vectorizer is deprecated. Use `multi2vec-google` instead.');
    const { name, vectorIndexConfig } = opts,
      config = __rest(opts, ['name', 'vectorIndexConfig']);
    const imageFields =
      (_a = config.imageFields) === null || _a === void 0 ? void 0 : _a.map(mapMulti2VecField);
    const textFields =
      (_b = config.textFields) === null || _b === void 0 ? void 0 : _b.map(mapMulti2VecField);
    const videoFields =
      (_c = config.videoFields) === null || _c === void 0 ? void 0 : _c.map(mapMulti2VecField);
    let weights = {};
    weights = formatMulti2VecFields(weights, 'imageFields', imageFields);
    weights = formatMulti2VecFields(weights, 'textFields', textFields);
    weights = formatMulti2VecFields(weights, 'videoFields', videoFields);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-palm',
        config: Object.assign(Object.assign({}, config), {
          imageFields:
            imageFields === null || imageFields === void 0 ? void 0 : imageFields.map((f) => f.name),
          textFields: textFields === null || textFields === void 0 ? void 0 : textFields.map((f) => f.name),
          videoFields:
            videoFields === null || videoFields === void 0 ? void 0 : videoFields.map((f) => f.name),
          weights: Object.keys(weights).length === 0 ? undefined : weights,
        }),
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-google'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-google'>} opts The configuration options for the `multi2vec-google` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-google'>} The configuration object.
   */
  multi2VecGoogle: (opts) => {
    var _a, _b, _c;
    const { name, vectorIndexConfig } = opts,
      config = __rest(opts, ['name', 'vectorIndexConfig']);
    const imageFields =
      (_a = config.imageFields) === null || _a === void 0 ? void 0 : _a.map(mapMulti2VecField);
    const textFields =
      (_b = config.textFields) === null || _b === void 0 ? void 0 : _b.map(mapMulti2VecField);
    const videoFields =
      (_c = config.videoFields) === null || _c === void 0 ? void 0 : _c.map(mapMulti2VecField);
    let weights = {};
    weights = formatMulti2VecFields(weights, 'imageFields', imageFields);
    weights = formatMulti2VecFields(weights, 'textFields', textFields);
    weights = formatMulti2VecFields(weights, 'videoFields', videoFields);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-google',
        config: Object.assign(Object.assign({}, config), {
          imageFields:
            imageFields === null || imageFields === void 0 ? void 0 : imageFields.map((f) => f.name),
          textFields: textFields === null || textFields === void 0 ? void 0 : textFields.map((f) => f.name),
          videoFields:
            videoFields === null || videoFields === void 0 ? void 0 : videoFields.map((f) => f.name),
          weights: Object.keys(weights).length === 0 ? undefined : weights,
        }),
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'ref2vec-centroid'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/ref2vec-centroid) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'ref2vec-centroid'>} opts The configuration options for the `ref2vec-centroid` vectorizer.
   * @returns {VectorConfigCreate<never, N, I, 'ref2vec-centroid'>} The configuration object.
   */
  ref2VecCentroid: (opts) => {
    const { name, vectorIndexConfig } = opts,
      config = __rest(opts, ['name', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'ref2vec-centroid',
        config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-aws'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/aws/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<N, T, I, 'text2vec-aws'>} opts The configuration options for the `text2vec-aws` vectorizer.
   * @returns { VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-aws'>} The configuration object.
   */
  text2VecAWS: (opts) => {
    const { name, sourceProperties, vectorIndexConfig } = opts,
      config = __rest(opts, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-aws',
        config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-azure-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/openai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-azure-openai'>} opts The configuration options for the `text2vec-azure-openai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-azure-openai'>} The configuration object.
   */
  text2VecAzureOpenAI: (opts) => {
    const { name, sourceProperties, vectorIndexConfig } = opts,
      config = __rest(opts, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-azure-openai',
        config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-cohere'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/cohere/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-cohere'>} [opts] The configuration options for the `text2vec-cohere` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-cohere'>} The configuration object.
   */
  text2VecCohere: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-cohere',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-contextionary'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/text2vec-contextionary) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-contextionary'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-contextionary'>} The configuration object.
   */
  text2VecContextionary: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-contextionary',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-databricks'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/databricks/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-databricks'>} opts The configuration for the `text2vec-databricks` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-databricks'>} The configuration object.
   */
  text2VecDatabricks: (opts) => {
    const { name, sourceProperties, vectorIndexConfig } = opts,
      config = __rest(opts, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-databricks',
        config: config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-gpt4all'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/gpt4all/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-gpt4all'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-gpt4all'>} The configuration object.
   */
  text2VecGPT4All: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-gpt4all',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-huggingface'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/huggingface/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-huggingface'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-huggingface'>} The configuration object.
   */
  text2VecHuggingFace: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-huggingface',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-jina'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/jinaai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-jina'>} [opts] The configuration for the `text2vec-jina` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-jina'>} The configuration object.
   */
  text2VecJina: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-jina',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-mistral'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/mistral/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-mistral'>} [opts] The configuration for the `text2vec-mistral` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-mistral'>} The configuration object.
   */
  text2VecMistral: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-mistral',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-octoai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/octoai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-octoai'>} [opts] The configuration for the `text2vec-octoai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-octoai'>} The configuration object.
   */
  text2VecOctoAI: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-octoai',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/openai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-openai'>} [opts] The configuration for the `text2vec-openai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-openai'>} The configuration object.
   */
  text2VecOpenAI: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-openai',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-ollama'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/ollama/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-ollama'>} [opts] The configuration for the `text2vec-ollama` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-ollama'>} The configuration object.
   */
  text2VecOllama: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-ollama',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-palm'>} opts The configuration for the `text2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-palm'>} The configuration object.
   * @deprecated Use `text2VecGoogle` instead.
   */
  text2VecPalm: (opts) => {
    console.warn('The `text2VecPalm` vectorizer is deprecated. Use `text2VecGoogle` instead.');
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-palm',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-google'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-google'>} opts The configuration for the `text2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-google'>} The configuration object.
   */
  text2VecGoogle: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-google',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-transformers'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/transformers/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-transformers'>} [opts] The configuration for the `text2vec-transformers` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-transformers'>} The configuration object.
   */
  text2VecTransformers: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-transformers',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-voyageai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/voyageai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-voyageai'>} [opts] The configuration for the `text2vec-voyageai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-voyageai'>} The configuration object.
   */
  text2VecVoyageAI: (opts) => {
    const _a = opts || {},
      { name, sourceProperties, vectorIndexConfig } = _a,
      config = __rest(_a, ['name', 'sourceProperties', 'vectorIndexConfig']);
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-voyageai',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
};
