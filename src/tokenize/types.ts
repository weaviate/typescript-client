import { Stopwords } from '../collections/types/index.js';

export type TextAnalyzerConfig = {
  asciiFold?: boolean | { ignore: string[] };
  stopwordPreset?: Stopwords | string;
};

export type TokenizeResult = {
  indexed: string[];
  query: string[];
};
