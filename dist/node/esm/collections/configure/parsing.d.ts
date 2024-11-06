import {
  BQConfigCreate,
  BQConfigUpdate,
  PQConfigCreate,
  PQConfigUpdate,
  SQConfigCreate,
  SQConfigUpdate,
} from './types/index.js';
type QuantizerConfig =
  | PQConfigCreate
  | PQConfigUpdate
  | BQConfigCreate
  | BQConfigUpdate
  | SQConfigCreate
  | SQConfigUpdate;
export declare class QuantizerGuards {
  static isPQCreate(config?: QuantizerConfig): config is PQConfigCreate;
  static isPQUpdate(config?: QuantizerConfig): config is PQConfigUpdate;
  static isBQCreate(config?: QuantizerConfig): config is BQConfigCreate;
  static isBQUpdate(config?: QuantizerConfig): config is BQConfigUpdate;
  static isSQCreate(config?: QuantizerConfig): config is SQConfigCreate;
  static isSQUpdate(config?: QuantizerConfig): config is SQConfigUpdate;
}
export declare function parseWithDefault<D>(value: D | undefined, defaultValue: D): D;
export {};
