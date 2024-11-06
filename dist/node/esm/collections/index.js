var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
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
import { WeaviateInvalidInputError, WeaviateUnsupportedFeatureError } from '../errors.js';
import ClassExists from '../schema/classExists.js';
import { ClassCreator, ClassDeleter, ClassGetter, SchemaGetter } from '../schema/index.js';
import collection from './collection/index.js';
import { classToCollection, resolveProperty, resolveReference } from './config/utils.js';
import { QuantizerGuards } from './configure/parsing.js';
import { configGuards } from './index.js';
const parseVectorIndex = (module) => {
  if (module.config === undefined) return undefined;
  if (module.name === 'dynamic') {
    const _a = module.config,
      { hnsw, flat } = _a,
      conf = __rest(_a, ['hnsw', 'flat']);
    return Object.assign(Object.assign({}, conf), {
      hnsw: parseVectorIndex({ name: 'hnsw', config: hnsw }),
      flat: parseVectorIndex({ name: 'flat', config: flat }),
    });
  }
  const _b = module.config,
    { quantizer } = _b,
    conf = __rest(_b, ['quantizer']);
  if (quantizer === undefined) return conf;
  if (QuantizerGuards.isBQCreate(quantizer)) {
    const { type } = quantizer,
      quant = __rest(quantizer, ['type']);
    return Object.assign(Object.assign({}, conf), {
      bq: Object.assign(Object.assign({}, quant), { enabled: true }),
    });
  }
  if (QuantizerGuards.isPQCreate(quantizer)) {
    const { type } = quantizer,
      quant = __rest(quantizer, ['type']);
    return Object.assign(Object.assign({}, conf), {
      pq: Object.assign(Object.assign({}, quant), { enabled: true }),
    });
  }
};
const parseVectorizerConfig = (config) => {
  if (config === undefined) return {};
  const _a = config,
    { vectorizeCollectionName } = _a,
    rest = __rest(_a, ['vectorizeCollectionName']);
  return Object.assign(Object.assign({}, rest), { vectorizeClassName: vectorizeCollectionName });
};
const collections = (connection, dbVersionSupport) => {
  const listAll = () =>
    new SchemaGetter(connection)
      .do()
      .then((schema) => (schema.classes ? schema.classes.map(classToCollection) : []));
  const deleteCollection = (name) => new ClassDeleter(connection).withClassName(name).do();
  return {
    create: function (config) {
      return __awaiter(this, void 0, void 0, function* () {
        const { name, invertedIndex, multiTenancy, replication, sharding } = config,
          rest = __rest(config, ['name', 'invertedIndex', 'multiTenancy', 'replication', 'sharding']);
        const supportsDynamicVectorIndex = yield dbVersionSupport.supportsDynamicVectorIndex();
        const supportsNamedVectors = yield dbVersionSupport.supportsNamedVectors();
        const supportsHNSWAndBQ = yield dbVersionSupport.supportsHNSWAndBQ();
        const moduleConfig = {};
        if (config.generative) {
          const generative =
            config.generative.name === 'generative-azure-openai'
              ? 'generative-openai'
              : config.generative.name;
          moduleConfig[generative] = config.generative.config ? config.generative.config : {};
        }
        if (config.reranker) {
          moduleConfig[config.reranker.name] = config.reranker.config ? config.reranker.config : {};
        }
        const makeVectorsConfig = (configVectorizers) => {
          let vectorizers = [];
          const vectorsConfig = {};
          const vectorizersConfig = Array.isArray(configVectorizers)
            ? configVectorizers
            : [Object.assign(Object.assign({}, configVectorizers), { name: 'default' })];
          vectorizersConfig.forEach((v) => {
            if (v.vectorIndex.name === 'dynamic' && !supportsDynamicVectorIndex.supports) {
              throw new WeaviateUnsupportedFeatureError(supportsDynamicVectorIndex.message);
            }
            const vectorConfig = {
              vectorIndexConfig: parseVectorIndex(v.vectorIndex),
              vectorIndexType: v.vectorIndex.name,
              vectorizer: {},
            };
            const vectorizer =
              v.vectorizer.name === 'text2vec-azure-openai' ? 'text2vec-openai' : v.vectorizer.name;
            vectorizers = [...vectorizers, vectorizer];
            vectorConfig.vectorizer[vectorizer] = Object.assign(
              { properties: v.properties },
              parseVectorizerConfig(v.vectorizer.config)
            );
            if (v.name === undefined) {
              throw new WeaviateInvalidInputError(
                'vectorName is required for each vectorizer when specifying more than one vectorizer'
              );
            }
            vectorsConfig[v.name] = vectorConfig;
          });
          return { vectorsConfig, vectorizers };
        };
        const makeLegacyVectorizer = (configVectorizers) => {
          const vectorizer =
            configVectorizers.vectorizer.name === 'text2vec-azure-openai'
              ? 'text2vec-openai'
              : configVectorizers.vectorizer.name;
          const moduleConfig = {};
          moduleConfig[vectorizer] = parseVectorizerConfig(configVectorizers.vectorizer.config);
          const vectorIndexConfig = parseVectorIndex(configVectorizers.vectorIndex);
          const vectorIndexType = configVectorizers.vectorIndex.name;
          if (
            vectorIndexType === 'hnsw' &&
            configVectorizers.vectorIndex.config !== undefined &&
            configGuards.quantizer.isBQ(configVectorizers.vectorIndex.config.quantizer)
          ) {
            if (!supportsHNSWAndBQ.supports) {
              throw new WeaviateUnsupportedFeatureError(supportsHNSWAndBQ.message);
            }
          }
          if (vectorIndexType === 'dynamic' && !supportsDynamicVectorIndex.supports) {
            throw new WeaviateUnsupportedFeatureError(supportsDynamicVectorIndex.message);
          }
          return {
            vectorizer,
            moduleConfig,
            vectorIndexConfig,
            vectorIndexType,
          };
        };
        let schema = Object.assign(Object.assign({}, rest), {
          class: name,
          invertedIndexConfig: invertedIndex,
          moduleConfig: moduleConfig,
          multiTenancyConfig: multiTenancy,
          replicationConfig: replication,
          shardingConfig: sharding,
        });
        let vectorizers = [];
        if (supportsNamedVectors.supports) {
          const { vectorsConfig, vectorizers: vecs } = config.vectorizers
            ? makeVectorsConfig(config.vectorizers)
            : { vectorsConfig: undefined, vectorizers: [] };
          schema.vectorConfig = vectorsConfig;
          vectorizers = [...vecs];
        } else {
          if (config.vectorizers !== undefined && Array.isArray(config.vectorizers)) {
            throw new WeaviateUnsupportedFeatureError(supportsNamedVectors.message);
          }
          const configs = config.vectorizers
            ? makeLegacyVectorizer(config.vectorizers)
            : {
                vectorizer: undefined,
                moduleConfig: undefined,
                vectorIndexConfig: undefined,
                vectorIndexType: undefined,
              };
          schema = Object.assign(Object.assign({}, schema), {
            moduleConfig: Object.assign(Object.assign({}, schema.moduleConfig), configs.moduleConfig),
            vectorizer: configs.vectorizer,
            vectorIndexConfig: configs.vectorIndexConfig,
            vectorIndexType: configs.vectorIndexType,
          });
          if (configs.vectorizer !== undefined) {
            vectorizers = [configs.vectorizer];
          }
        }
        const properties = config.properties
          ? config.properties.map((prop) => resolveProperty(prop, vectorizers))
          : [];
        const references = config.references ? config.references.map(resolveReference) : [];
        schema.properties = [...properties, ...references];
        yield new ClassCreator(connection).withClass(schema).do();
        return collection(connection, name, dbVersionSupport);
      });
    },
    createFromSchema: function (config) {
      return __awaiter(this, void 0, void 0, function* () {
        const { class: name } = yield new ClassCreator(connection).withClass(config).do();
        return collection(connection, name, dbVersionSupport);
      });
    },
    delete: deleteCollection,
    deleteAll: () =>
      listAll().then((configs) =>
        Promise.all(
          configs === null || configs === void 0 ? void 0 : configs.map((c) => deleteCollection(c.name))
        )
      ),
    exists: (name) => new ClassExists(connection).withClassName(name).do(),
    export: (name) => new ClassGetter(connection).withClassName(name).do().then(classToCollection),
    listAll: listAll,
    get: (name) => collection(connection, name, dbVersionSupport),
  };
};
export default collections;
export * from './aggregate/index.js';
export * from './backup/index.js';
export * from './cluster/index.js';
export * from './collection/index.js';
export * from './config/index.js';
export * from './configure/index.js';
export * from './data/index.js';
export * from './filters/index.js';
export * from './generate/index.js';
export * from './iterator/index.js';
export * from './query/index.js';
export * from './references/index.js';
export * from './sort/index.js';
export * from './tenants/index.js';
export * from './types/index.js';
export * from './vectors/multiTargetVector.js';
