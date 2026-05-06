import { StopwordsPreset } from '../collections/types/index.js';

export type TextAnalyzerConfig = {
  asciiFold?: boolean | { ignore: string[] };
  stopwordPreset?: StopwordsPreset | string;
};

export type TokenizeResult = {
  indexed: string[];
  query: string[];
};
