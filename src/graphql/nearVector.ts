export interface NearVectorArgs {
  certainty?: number;
  distance?: number;
  vector: number[] | Record<string, number[]>;
  targetVectors?: string[] | NearVectorTargetsType;
}

export type NearVectorTargetsType = {
  combinationMethod: 'minimum' | 'average' | 'sum' | 'manualWeights' | 'relativeScore';
  targetVectors: string[];
  weights?: Record<string, number>;
};

export class MultiVectorTargets {
  static sum(targetVectors: string[]) {
    return {
      combinationMethod: 'sum' as const,
      targetVectors,
    };
  }
  static average(targetVectors: string[]) {
    return {
      combinationMethod: 'average' as const,
      targetVectors,
    };
  }
  static minimum(targetVectors: string[]) {
    return {
      combinationMethod: 'minimum' as const,
      targetVectors,
    };
  }
  static manualWeights(weights: Record<string, number>) {
    return {
      combinationMethod: 'manualWeights' as const,
      targetVectors: Object.keys(weights),
      weights,
    };
  }
  static relativeScore(weightedVectors: Record<string, number[]>) {
    return {
      combinationMethod: 'relativeScore' as const,
      targetVectors: Object.keys(weightedVectors),
      weights: weightedVectors,
    };
  }
}

export default class GraphQLNearVector {
  private certainty?: number;
  private distance?: number;
  private vector: number[] | Record<string, number[]>;
  private targetVectors?: string[] | NearVectorTargetsType;

  constructor(args: NearVectorArgs) {
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.vector = args.vector;
    this.targetVectors = args.targetVectors;
  }

  toString(wrap = true) {
    let args: string[] = [];

    args = parseVector(args, this.vector);

    args = parseTargetVectors(args, this.targetVectors);

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (MultiVectorGuards.isMultiVector(this.vector) && this.targetVectors === undefined) {
      args = [...args, `targets:{targetVectors:${JSON.stringify(Object.keys(this.vector))}}`];
    }

    if (!wrap) {
      return `${args.join(',')}`;
    }
    return `{${args.join(',')}}`;
  }
}

class MultiVectorGuards {
  static isSingleVector(vector?: number[] | Record<string, number[]>): vector is number[] {
    return vector !== undefined && Array.isArray(vector);
  }
  static isMultiVector(vector?: number[] | Record<string, number[]>): vector is Record<string, number[]> {
    return vector !== undefined && !Array.isArray(vector);
  }
  static isTargetVectors(targetVectors?: string[] | NearVectorTargetsType): targetVectors is string[] {
    return Array.isArray(targetVectors);
  }
  static isTargets(targetVectors?: string[] | NearVectorTargetsType): targetVectors is NearVectorTargetsType {
    return targetVectors !== undefined && !Array.isArray(targetVectors);
  }
}

export const parseTargetVectors = (args: string[], targetVectors?: string[] | NearVectorTargetsType) => {
  if (MultiVectorGuards.isTargetVectors(targetVectors) && targetVectors.length > 0) {
    args = [...args, `targetVectors:${JSON.stringify(targetVectors)}`];
  }

  if (MultiVectorGuards.isTargets(targetVectors)) {
    args = [
      ...args,
      `targets:{combinationMethod:${targetVectors.combinationMethod},targetVectors:${JSON.stringify(
        targetVectors.targetVectors
      )}${
        targetVectors.weights
          ? `,weights:{${Object.entries(targetVectors.weights)
              .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
              .join(',')}}`
          : ''
      }}`,
    ];
  }

  return args;
};

export const parseVector = (args: string[], vector?: number[] | Record<string, number[]>) => {
  if (MultiVectorGuards.isSingleVector(vector)) {
    args = [...args, `vector:${JSON.stringify(vector)}`];
  }

  if (MultiVectorGuards.isMultiVector(vector)) {
    args = [
      ...args,
      `vectorPerTarget:{${Object.entries(vector)
        .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
        .join(',')}}`,
    ];
  }

  return args;
};
