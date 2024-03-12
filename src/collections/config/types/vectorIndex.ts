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
  quantizer: PQConfig | BQConfig | undefined;
  skip: boolean;
  vectorCacheMaxObjects: number;
};

export type VectorIndexConfigFlat = {
  distance: VectorDistance;
  vectorCacheMaxObjects: number;
  quantizer: BQConfig | undefined;
};

export type VectorIndexConfigType<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSW
  : I extends 'flat'
  ? VectorIndexConfigFlat
  : I extends string
  ? Record<string, any>
  : never;

export type BQConfig = {
  cache: boolean;
  rescoreLimit: number;
  type: 'bq';
};

export type PQConfig = {
  bitCompression: boolean;
  centroids: number;
  encoder: PQEncoderConfig;
  segments: number;
  trainingLimit: number;
  type: 'pq';
};

export type PQEncoderConfig = {
  type: PQEncoderType;
  distribution: PQEncoderDistribution;
};

export type VectorDistance = 'cosine' | 'dot' | 'l2-squared' | 'hamming';

export type PQEncoderType = 'kmeans' | 'tile';
export type PQEncoderDistribution = 'log-normal' | 'normal';

export type VectorIndexType = 'hnsw' | 'flat' | string;

export type VectorIndexConfig = VectorIndexConfigHNSW | VectorIndexConfigFlat;