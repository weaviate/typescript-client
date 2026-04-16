import { Stopwords, Tokenization } from '../collections/types/index.js';
import ConnectionGRPC from '../connection/grpc.js';
import { WeaviateTokenizeRequest, WeaviateTokenizeResponse } from '../openapi/types.js';
import { DbVersionSupport } from '../utils/dbVersion.js';
import { TextAnalyzerConfig, TokenizeResult } from './types.js';
import { parseResult } from './util.js';

const tokenize = (connection: ConnectionGRPC, dbVersionSupport: DbVersionSupport): Tokenize => {
  const parseTextAnalyzerConfig = (config?: TextAnalyzerConfig) => {
    if (config == undefined) return undefined;
    const out = { stopwordPreset: config.stopwordPreset ? String(config.stopwordPreset) : undefined };
    if (typeof config?.asciiFold === 'boolean') {
      return { ...out, asciiFold: config?.asciiFold };
    } else if (typeof config?.asciiFold === 'object') {
      return {
        ...out,
        asciiFold: true,
        asciiFoldIgnore: config?.asciiFold.ignore,
      };
    }
    return out;
  };
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
              analyzerConfig: parseTextAnalyzerConfig(opts?.analyzerConfig),
              stopwordPresets: opts?.stopwordPresets,
            })
            .then(parseResult)
        );
    },
  };
};

export interface Tokenize {
  text: (
    text: string,
    tokenization: Tokenization,
    opts?: {
      analyzerConfig?: TextAnalyzerConfig;
      stopwordPresets?: Record<string, Partial<Stopwords>>;
    }
  ) => Promise<TokenizeResult>;
}

export default tokenize;
