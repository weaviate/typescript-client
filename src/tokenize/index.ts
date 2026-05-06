import { textAnalyzerConfigToWire } from '../collections/config/utils.js';
import { Stopwords, Tokenization } from '../collections/types/index.js';
import ConnectionGRPC from '../connection/grpc.js';
import { WeaviateInvalidInputError } from '../errors.js';
import {
  WeaviatePropertyTokenizeRequest,
  WeaviateTokenizeRequest,
  WeaviateTokenizeResponse,
} from '../openapi/types.js';
import { DbVersionSupport } from '../utils/dbVersion.js';
import { TextAnalyzerConfig, TokenizeResult } from './types.js';
import { parseResult } from './util.js';

const tokenize = (connection: ConnectionGRPC, dbVersionSupport: DbVersionSupport): Tokenize => {
  return {
    text: (text, tokenization, opts) => {
      if (opts?.stopwords !== undefined && opts?.stopwordPresets !== undefined) {
        return Promise.reject(
          new WeaviateInvalidInputError(
            'stopwords and stopwordPresets are mutually exclusive; pass at most one'
          )
        );
      }
      return dbVersionSupport
        .supportsTokenize()
        .then(({ supports, message }) => (supports ? Promise.resolve() : Promise.reject(new Error(message))))
        .then(() =>
          connection
            .postReturn<WeaviateTokenizeRequest, WeaviateTokenizeResponse>('/tokenize', {
              text,
              tokenization,
              analyzerConfig: textAnalyzerConfigToWire(opts?.analyzerConfig),
              stopwords: opts?.stopwords,
              stopwordPresets: opts?.stopwordPresets,
            })
            .then(parseResult)
        );
    },
    forProperty: (collection, property, text) =>
      dbVersionSupport
        .supportsTokenize()
        .then(({ supports, message }) => (supports ? Promise.resolve() : Promise.reject(new Error(message))))
        .then(() =>
          connection.postReturn<WeaviatePropertyTokenizeRequest, WeaviateTokenizeResponse>(
            `/schema/${collection}/properties/${property}/tokenize`,
            { text }
          )
        )
        .then(parseResult),
  };
};

export interface Tokenize {
  text: (
    text: string,
    tokenization: Tokenization,
    opts?: {
      analyzerConfig?: TextAnalyzerConfig;
      /**
       * One-off stopwords block applied directly to this request. Mirrors the
       * collection-level `invertedIndexConfig.stopwords` shape (preset +
       * additions + removals). Mutually exclusive with `stopwordPresets`.
       */
      stopwords?: Partial<Stopwords>;
      /**
       * User-defined named stopword lists. Keyed by preset name; each value is a
       * flat array of stopword strings. Mirrors the wire format accepted by
       * Weaviate's `/v1/tokenize` endpoint (>= v1.37.2) and the schema-level
       * `invertedIndexConfig.stopwordPresets`. Mutually exclusive with
       * `stopwords`.
       */
      stopwordPresets?: { [presetName: string]: string[] };
    }
  ) => Promise<TokenizeResult>;
  forProperty: (collection: string, property: string, text: string) => Promise<TokenizeResult>;
}

export default tokenize;
