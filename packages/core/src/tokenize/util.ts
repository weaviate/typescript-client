import { WeaviateTokenizeResponse } from '../openapi/types.js';
import { TokenizeResult } from './types.js';

export const parseResult = (res: WeaviateTokenizeResponse): TokenizeResult => ({
  indexed: res.indexed || [],
  query: res.query || [],
});
