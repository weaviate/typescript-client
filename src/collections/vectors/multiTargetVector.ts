export type MultiTargetVectorJoinCombination =
  | 'sum'
  | 'average'
  | 'minimum'
  | 'relative-score'
  | 'manual-weights';

export type MultiTargetVectorJoin = {
  combination: MultiTargetVectorJoinCombination;
  targetVectors: string[];
  weights?: Record<string, number>;
};

export default () => {
  return {
    sum: (targetVectors: string[]) => {
      return { combination: 'sum' as MultiTargetVectorJoinCombination, targetVectors };
    },
    average: (targetVectors: string[]) => {
      return { combination: 'average' as MultiTargetVectorJoinCombination, targetVectors };
    },
    minimum: (targetVectors: string[]) => {
      return { combination: 'minimum' as MultiTargetVectorJoinCombination, targetVectors };
    },
    relativeScore: (weights: Record<string, number>) => {
      return {
        combination: 'relative-score' as MultiTargetVectorJoinCombination,
        targetVectors: Object.keys(weights),
        weights,
      };
    },
    manualWeights: (weights: Record<string, number>) => {
      return {
        combination: 'manual-weights' as MultiTargetVectorJoinCombination,
        targetVectors: Object.keys(weights),
        weights,
      };
    },
  };
};

export interface MultiTargetVector {
  sum: (targetVectors: string[]) => MultiTargetVectorJoin;
  average: (targetVectors: string[]) => MultiTargetVectorJoin;
  minimum: (targetVectors: string[]) => MultiTargetVectorJoin;
  relativeScore: (weights: Record<string, number>) => MultiTargetVectorJoin;
  manualWeights: (weights: Record<string, number>) => MultiTargetVectorJoin;
}
