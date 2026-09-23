import { CountRef, FilterTargetInternal, MultiTargetRef, SingleTargetRef } from './types.js';

export class TargetGuards {
  public static isSingleTargetRef(target?: FilterTargetInternal): target is SingleTargetRef {
    if (!target) return false;
    return (target as SingleTargetRef).type_ === 'single';
  }

  public static isMultiTargetRef(target?: FilterTargetInternal): target is MultiTargetRef {
    if (!target) return false;
    return (target as MultiTargetRef).type_ === 'multi';
  }

  public static isCountRef(target?: FilterTargetInternal): target is CountRef {
    if (!target) return false;
    return (target as CountRef).type_ === 'count';
  }

  public static isProperty(target?: FilterTargetInternal): target is string {
    if (!target) return false;
    return typeof target === 'string';
  }

  public static isTargetRef(target?: FilterTargetInternal): target is SingleTargetRef | MultiTargetRef {
    if (!target) return false;
    return TargetGuards.isSingleTargetRef(target) || TargetGuards.isMultiTargetRef(target);
  }
}
