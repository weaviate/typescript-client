import { PQConfigCreate, BQConfigCreate } from './types';

export class QuantizerGuards {
  static isPQ(config: BQConfigCreate | PQConfigCreate): config is PQConfigCreate {
    return (config as PQConfigCreate).type === 'pq';
  }
  static isBQ(config: BQConfigCreate | PQConfigCreate): config is BQConfigCreate {
    return (config as BQConfigCreate).type === 'bq';
  }
}

export function parseWithDefault<D>(value: D | undefined, defaultValue: D): D {
  return value !== undefined ? value : defaultValue;
}

export const parseQuantizer = <T extends PQConfigCreate | BQConfigCreate>(config?: T): T | undefined => {
  if (config === undefined) {
    return undefined;
  }
  if (QuantizerGuards.isPQ(config)) {
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
  } else if (QuantizerGuards.isBQ(config)) {
    return {
      cache: parseWithDefault(config.cache, false),
      rescoreLimit: parseWithDefault(config.rescoreLimit, 1000),
      type: 'bq',
    } as T;
  }
  return config;
};
