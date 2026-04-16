import { Stopwords, Tokenization } from '../collections/types/index.js';

export type TextAnalyzerConfig = {
  asciiFold?: boolean | { ignore?: string[] };
  stopwordPreset?: Stopwords | string;
};

export type TokenizeResult = {
  tokenization: Tokenization | string;
  indexed: string[];
  query: string[];
  analyzerConfig?: TextAnalyzerConfig;
  stopwordConfig?: Partial<Stopwords>;
};
