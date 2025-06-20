/** The allowed combination methods for multi-target vector joins */
export type MultiTargetVectorJoinCombination =
  | 'sum'
  | 'average'
  | 'minimum'
  | 'relative-score'
  | 'manual-weights';

/** Weights for each target vector in a multi-target vector join */
export type MultiTargetVectorWeights = Record<string, number | number[]>;

/** A multi-target vector join used when specifying a vector-based query */
export type MultiTargetVectorJoin = {
  /** The combination method to use for the target vectors */
  combination: MultiTargetVectorJoinCombination;
  /** The target vectors to combine */
  targetVectors: string[];
  /** The weights to use for each target vector */
  weights?: MultiTargetVectorWeights;
};

export default () => {
  return {
    sum: (targetVectors: string[]): MultiTargetVectorJoin => {
      return { combination: 'sum' as MultiTargetVectorJoinCombination, targetVectors };
    },
    average: (targetVectors: string[]): MultiTargetVectorJoin => {
      return { combination: 'average' as MultiTargetVectorJoinCombination, targetVectors };
    },
    minimum: (targetVectors: string[]): MultiTargetVectorJoin => {
      return { combination: 'minimum' as MultiTargetVectorJoinCombination, targetVectors };
    },
    relativeScore: (weights: MultiTargetVectorWeights): MultiTargetVectorJoin => {
      return {
        combination: 'relative-score' as MultiTargetVectorJoinCombination,
        targetVectors: Object.keys(weights),
        weights,
      };
    },
    manualWeights: (weights: MultiTargetVectorWeights): MultiTargetVectorJoin => {
      return {
        combination: 'manual-weights' as MultiTargetVectorJoinCombination,
        targetVectors: Object.keys(weights),
        weights,
      };
    },
  };
};

export interface MultiTargetVector {
  /** Create a multi-target vector join that sums the vector scores over the target vectors */
  sum: (targetVectors: string[]) => MultiTargetVectorJoin;
  /** Create a multi-target vector join that averages the vector scores over the target vectors */
  average: (targetVectors: string[]) => MultiTargetVectorJoin;
  /** Create a multi-target vector join that takes the minimum vector score over the target vectors */
  minimum: (targetVectors: string[]) => MultiTargetVectorJoin;
  /** Create a multi-target vector join that uses relative weights for each target vector */
  relativeScore: (weights: MultiTargetVectorWeights) => MultiTargetVectorJoin;
  /** Create a multi-target vector join that uses manual weights for each target vector */
  manualWeights: (weights: MultiTargetVectorWeights) => MultiTargetVectorJoin;
}
