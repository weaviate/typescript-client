export interface HybridArgs {
  alpha?: number;
  query: string;
  vector?: number[];
  properties?: string[];
  targetVectors?: string[];
  fusionType?: FusionType;
}

export enum FusionType {
  rankedFusion = 'rankedFusion',
  relativeScoreFusion = 'relativeScoreFusion',
}

export default class GraphQLHybrid {
  private alpha?: number;
  private query: string;
  private vector?: number[];
  private properties?: string[];
  private targetVectors?: string[];
  private fusionType?: FusionType;

  constructor(args: HybridArgs) {
    this.alpha = args.alpha;
    this.query = args.query;
    this.vector = args.vector;
    this.properties = args.properties;
    this.targetVectors = args.targetVectors;
    this.fusionType = args.fusionType;
  }

  toString() {
    let args = [`query:${JSON.stringify(this.query)}`]; // query must always be set

    if (this.alpha !== undefined) {
      args = [...args, `alpha:${JSON.stringify(this.alpha)}`];
    }

    if (this.vector !== undefined) {
      args = [...args, `vector:${JSON.stringify(this.vector)}`];
    }

    if (this.properties && this.properties.length > 0) {
      args = [...args, `properties:${JSON.stringify(this.properties)}`];
    }

    if (this.targetVectors && this.targetVectors.length > 0) {
      args = [...args, `targetVectors:${JSON.stringify(this.targetVectors)}`];
    }

    if (this.fusionType !== undefined) {
      args = [...args, `fusionType:${this.fusionType}`];
    }

    return `{${args.join(',')}}`;
  }
}
