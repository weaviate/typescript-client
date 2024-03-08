export type VectorIndexConfigHNSW = {
  cleanupIntervalSeconds: number;
  distance: VectorDistance;
  dynamicEfMin: number;
  dynamicEfMax: number;
  dynamicEfFactor: number;
  efConstruction: number;
  ef: number;
  flatSearchCutoff: number;
  maxConnections: number;
  pq: PQConfig;
  skip: boolean;
  vectorCacheMaxObjects: number;
};

export type VectorIndexConfigFlat = {
  distance: VectorDistance;
  vectorCacheMaxObjects: number;
  bq: BQConfig;
};

export type VectorIndexConfig<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSW
  : I extends 'flat'
  ? VectorIndexConfigFlat
  : I extends string
  ? Record<string, any>
  : never;

export type BQConfig = {
  cache: boolean;
  rescoreLimit: number;
};

export type PQConfig = {
  bitCompression: boolean;
  centroids: number;
  enabled: boolean;
  encoder: PQEncoderConfig;
  segments: number;
  trainingLimit: number;
};

export type PQEncoderConfig = {
  type: PQEncoderType;
  distribution: PQEncoderDistribution;
};

export type VectorDistance = 'cosine' | 'dot' | 'l2-squared' | 'hamming';

export type PQEncoderType = 'kmeans' | 'tile';
export type PQEncoderDistribution = 'log_normal' | 'normal';

export type VectorIndexType = 'hnsw' | 'flat' | string;
