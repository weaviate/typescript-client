import { MuveraEncodingConfigCreate } from '../index.js';
import {
  BQConfigCreate,
  BQConfigUpdate,
  PQConfigCreate,
  PQConfigUpdate,
  SQConfigCreate,
  SQConfigUpdate,
  VectorIndexConfigDynamicCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types/index.js';

type QuantizerConfig =
  | PQConfigCreate
  | PQConfigUpdate
  | BQConfigCreate
  | BQConfigUpdate
  | SQConfigCreate
  | SQConfigUpdate;

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
}

type VectorIndexConfigCreate =
  | VectorIndexConfigHNSWCreate
  | VectorIndexConfigFlatCreate
  | VectorIndexConfigDynamicCreate
  | Record<string, any>;

export class VectorIndexGuards {
  static isHNSW(config?: VectorIndexConfigCreate): config is VectorIndexConfigHNSWCreate {
    return (config as VectorIndexConfigHNSWCreate)?.type === 'hnsw';
  }
  static isFlat(config?: VectorIndexConfigCreate): config is VectorIndexConfigFlatCreate {
    return (config as VectorIndexConfigFlatCreate)?.type === 'flat';
  }
  static isDynamic(config?: VectorIndexConfigCreate): config is VectorIndexConfigDynamicCreate {
    return (config as VectorIndexConfigDynamicCreate)?.type === 'dynamic';
  }
}

export class MultiVectorEncodingGuards {
  static isMuvera(config?: Record<string, any>): config is MuveraEncodingConfigCreate {
    return (config as { type: string })?.type === 'muvera';
  }
}

export function parseWithDefault<D>(value: D | undefined, defaultValue: D): D {
  return value !== undefined ? value : defaultValue;
}
