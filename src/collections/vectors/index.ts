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

  // constructor(combination: MultiTargetVectorJoinCombination, targetVectors: string[], weights?: Record<string, number>) {
  //   this.combination = combination
  //   this.targetVectors = targetVectors;
  //   this.weights = weights;
  // }

  // private mapCombination(): CombinationMethod {
  //   switch (this.combination) {
  //     case 'sum':
  //       return CombinationMethod.COMBINATION_METHOD_TYPE_SUM;
  //     case 'average':
  //       return CombinationMethod.COMBINATION_METHOD_TYPE_AVERAGE;
  //     case 'minimum':
  //       return CombinationMethod.COMBINATION_METHOD_TYPE_MIN;
  //     case 'relative-score':
  //       return CombinationMethod.COMBINATION_METHOD_TYPE_RELATIVE_SCORE;
  //     case 'manual-weights':
  //       return CombinationMethod.COMBINATION_METHOD_TYPE_MANUAL;
  //     default:
  //       throw new Error('Invalid combination method');
  //   }
  // }

  // public toGrpcTargetVector(): Targets {
  //   return {
  //     combination: this.mapCombination(),
  //     targetVectors: this.targetVectors,
  //     weights: this.weights ? this.weights : {}
  //   }
  // }
};

export const targetVectors = {
  sum: (targetVectors: string[]) => {
    return { combination: 'sum', targetVectors };
  },
  average: (targetVectors: string[]) => {
    return { combination: 'average', targetVectors };
  },
  minimum: (targetVectors: string[]) => {
    return { combination: 'minimum', targetVectors };
  },
  relativeScore: (weights: Record<string, number>) => {
    return { combination: 'relative-score', targetVectors: Object.keys(weights), weights };
  },
  manualWeights: (weights: Record<string, number>) => {
    return { combiantion: 'manual-weights', targetVectors: Object.keys(weights), weights };
  },
};
