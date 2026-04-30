import { textAnalyzerConfigToWire } from '../collections/config/utils.js';
import { Tokenization } from '../collections/types/index.js';
import ConnectionGRPC from '../connection/grpc.js';
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
      return dbVersionSupport
        .supportsTokenize()
        .then(({ supports, message }) => (supports ? Promise.resolve() : Promise.reject(new Error(message))))
        .then(() =>
          connection
            .postReturn<WeaviateTokenizeRequest, WeaviateTokenizeResponse>('/tokenize', {
              text,
              tokenization,
              analyzerConfig: textAnalyzerConfigToWire(opts?.analyzerConfig),
              stopwordPresets: opts?.stopwordPresets as WeaviateTokenizeRequest['stopwordPresets'],
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
       * User-defined named stopword lists. Keyed by preset name; each value is a
       * flat array of stopword strings. Mirrors the wire format accepted by
       * Weaviate's `/v1/tokenize` endpoint (>= v1.37.2) and the schema-level
       * `invertedIndexConfig.stopwordPresets`.
       */
      stopwordPresets?: { [presetName: string]: string[] };
    }
  ) => Promise<TokenizeResult>;
  forProperty: (collection: string, property: string, text: string) => Promise<TokenizeResult>;
}

export default tokenize;
