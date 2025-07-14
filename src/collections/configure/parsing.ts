import {
  BQConfigCreate,
  BQConfigUpdate,
  PQConfigCreate,
  PQConfigUpdate,
  RQConfigCreate,
  RQConfigUpdate,
  SQConfigCreate,
  SQConfigUpdate,
} from './types/index.js';

type QuantizerConfig =
  | PQConfigCreate
  | PQConfigUpdate
  | BQConfigCreate
  | BQConfigUpdate
  | SQConfigCreate
  | SQConfigUpdate
  | RQConfigCreate
  | RQConfigUpdate;

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
  static isSQCreate(config?: QuantizerConfig): config is SQConfigCreate {
    return (config as SQConfigCreate)?.type === 'sq';
  }
  static isSQUpdate(config?: QuantizerConfig): config is SQConfigUpdate {
    return (config as SQConfigUpdate)?.type === 'sq';
  }
  static isRQCreate(config?: QuantizerConfig): config is RQConfigCreate {
    return (config as RQConfigCreate)?.type === 'rq';
  }
  static isRQUpdate(config?: QuantizerConfig): config is RQConfigUpdate {
    return (config as RQConfigUpdate)?.type === 'rq';
  }
}

export function parseWithDefault<D>(value: D | undefined, defaultValue: D): D {
  return value !== undefined ? value : defaultValue;
}
