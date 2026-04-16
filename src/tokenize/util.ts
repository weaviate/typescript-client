import { WeaviateTokenizeResponse } from '../openapi/types.js';
import { TokenizeResult } from './types.js';

export const parseResult = (res: WeaviateTokenizeResponse): TokenizeResult => {
  if (!res.tokenization) {
    throw new Error('Tokenization type is missing in the response');
  }
  return {
    tokenization: res.tokenization,
    indexed: res.indexed || [],
    query: res.query || [],
    analyzerConfig:
      res.analyzerConfig !== undefined
        ? {
            asciiFold: res.analyzerConfig.asciiFold
              ? res.analyzerConfig.asciiFoldIgnore !== undefined
                ? {
                    ignore: res.analyzerConfig.asciiFoldIgnore,
                  }
                : true
              : undefined,
            stopwordPreset: res.analyzerConfig.stopwordPreset,
          }
        : undefined,
    stopwordConfig: res.stopwordConfig,
  };
};
