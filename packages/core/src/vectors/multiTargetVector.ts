import { TargetVector } from '../query/types.js';

/** The allowed combination methods for multi-target vector joins */
export type MultiTargetVectorJoinCombination =
  | 'sum'
  | 'average'
  | 'minimum'
  | 'relative-score'
  | 'manual-weights';

/** Weights for each target vector in a multi-target vector join */
export type MultiTargetVectorWeights<V> = Partial<Record<TargetVector<V>, number | number[]>>;

/** A multi-target vector join used when specifying a vector-based query */
export type MultiTargetVectorJoin<V> = {
  /** The combination method to use for the target vectors */
  combination: MultiTargetVectorJoinCombination;
  /** The target vectors to combine */
  targetVectors: TargetVector<V>[];
  /** The weights to use for each target vector */
  weights?: MultiTargetVectorWeights<V>;
};

export default <V>() => {
  return {
    sum: <T extends TargetVector<V>[]>(targetVectors: T): MultiTargetVectorJoin<V> => {
      return { combination: 'sum' as MultiTargetVectorJoinCombination, targetVectors };
    },
    average: <T extends TargetVector<V>[]>(targetVectors: T): MultiTargetVectorJoin<V> => {
      return { combination: 'average' as MultiTargetVectorJoinCombination, targetVectors };
    },
    minimum: <T extends TargetVector<V>[]>(targetVectors: T): MultiTargetVectorJoin<V> => {
      return { combination: 'minimum' as MultiTargetVectorJoinCombination, targetVectors };
    },
    relativeScore: <T extends TargetVector<V>[]>(
      weights: MultiTargetVectorWeights<V>
    ): MultiTargetVectorJoin<V> => {
      return {
        combination: 'relative-score' as MultiTargetVectorJoinCombination,
        targetVectors: Object.keys(weights) as T,
        weights,
      };
    },
    manualWeights: <T extends TargetVector<V>[]>(
      weights: MultiTargetVectorWeights<V>
    ): MultiTargetVectorJoin<V> => {
      return {
        combination: 'manual-weights' as MultiTargetVectorJoinCombination,
        targetVectors: Object.keys(weights) as T,
        weights,
      };
    },
  };
};

export interface MultiTargetVector<V> {
  /** Create a multi-target vector join that sums the vector scores over the target vectors */
  sum: <T extends TargetVector<V>[]>(targetVectors: T) => MultiTargetVectorJoin<V>;
  /** Create a multi-target vector join that averages the vector scores over the target vectors */
  average: <T extends TargetVector<V>[]>(targetVectors: T) => MultiTargetVectorJoin<V>;
  /** Create a multi-target vector join that takes the minimum vector score over the target vectors */
  minimum: <T extends TargetVector<V>[]>(targetVectors: T) => MultiTargetVectorJoin<V>;
  /** Create a multi-target vector join that uses relative weights for each target vector */
  relativeScore: <T extends TargetVector<V>[]>(
    weights: MultiTargetVectorWeights<V>
  ) => MultiTargetVectorJoin<V>;
  /** Create a multi-target vector join that uses manual weights for each target vector */
  manualWeights: <T extends TargetVector<V>[]>(
    weights: MultiTargetVectorWeights<V>
  ) => MultiTargetVectorJoin<V>;
}
