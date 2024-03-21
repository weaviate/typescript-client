import { PQConfigCreate, PQConfigUpdate, BQConfigCreate, BQConfigUpdate } from './types/index.js';

type QuantizerConfig = PQConfigCreate | PQConfigUpdate | BQConfigCreate | BQConfigUpdate;

export class QuantizerGuards {
  static isPQCreate(config?: QuantizerConfig): config is PQConfigCreate {
    return (config as PQConfigCreate)?.type === 'pq';
  }
  static isPQUpdate(config?: QuantizerConfig): config is PQConfigUpdate {
    return (config as PQConfigUpdate)?.type === 'pq';
  }
  static isBQCreate(config?: QuantizerConfig): config is BQConfigCreate {
    return (config as BQConfigCreate)?.type === 'bq';
  }
  static isBQUpdate(config?: QuantizerConfig): config is BQConfigUpdate {
    return (config as BQConfigUpdate)?.type === 'bq';
  }
}

export function parseWithDefault<D>(value: D | undefined, defaultValue: D): D {
  return value !== undefined ? value : defaultValue;
}

export const parseQuantizer = <T extends QuantizerConfig>(config?: T): T | undefined => {
  if (config === undefined) {
    return undefined;
  }
  if (QuantizerGuards.isPQCreate(config)) {
    return {
      bitCompression: parseWithDefault(config.bitCompression, false),
      centroids: parseWithDefault(config.centroids, 256),
      encoder: config.encoder
        ? {
            distribution: parseWithDefault(config.encoder.distribution, 'log_normal'),
            type: parseWithDefault(config.encoder.type, 'kmeans'),
          }
        : undefined,
      segments: parseWithDefault(config.segments, 0),
      trainingLimit: parseWithDefault(config.trainingLimit, 100000),
      type: 'pq',
    } as T;
  } else if (QuantizerGuards.isBQCreate(config)) {
    return {
      cache: parseWithDefault(config.cache, false),
      rescoreLimit: parseWithDefault(config.rescoreLimit, 1000),
      type: 'bq',
    } as T;
  }
  return config;
};
