import { BQConfigCreate, BQConfigUpdate, PQConfigCreate, PQConfigUpdate } from './types/index.js';

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
      ...config,
      type: 'pq',
    } as T;
  } else if (QuantizerGuards.isBQCreate(config)) {
    return {
      ...config,
      type: 'bq',
    } as T;
  }
  return config;
};
