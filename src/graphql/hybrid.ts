import { Move, parseMove } from './nearText';

export interface HybridArgs {
  alpha?: number;
  query: string;
  vector?: number[];
  properties?: string[];
  targetVectors?: string[];
  fusionType?: FusionType;
  searches?: (NearTextSubSearch | NearVectorSubSearch)[];
}

export interface NearTextSubSearch {
  concepts: string[];
  certainty?: number;
  distance?: number;
  moveAwayFrom?: Move;
  moveTo?: Move;
}

export interface NearVectorSubSearch {
  vector: number[];
  certainty?: number;
  distance?: number;
  targetVectors?: string[];
}

export enum FusionType {
  rankedFusion = 'rankedFusion',
  relativeScoreFusion = 'relativeScoreFusion',
}

class GraphQLHybridSubSearch {
  constructor() {
    if (new.target === GraphQLHybridSubSearch) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  static fromArgs(args: NearTextSubSearch | NearVectorSubSearch): GraphQLHybridSubSearch {
    if ('concepts' in args) {
      return new GraphQLHybridSubSearchNearText(args);
    } else {
      return new GraphQLHybridSubSearchNearVector(args);
    }
  }

  toString(): string {
    throw new Error('Method not implemented.');
  }
}

class GraphQLHybridSubSearchNearText extends GraphQLHybridSubSearch {
  private concepts: string[];
  private certainty?: number;
  private distance?: number;
  private moveAwayFrom?: Move;
  private moveTo?: Move;

  constructor(args: NearTextSubSearch) {
    super();
    this.concepts = args.concepts;
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.moveAwayFrom = args.moveAwayFrom;
    this.moveTo = args.moveTo;
  }

  toString(): string {
    let args = [`concepts:${JSON.stringify(this.concepts)}`];
    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }
    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }
    if (this.moveTo) {
      args = [...args, parseMove('moveTo', this.moveTo)];
    }
    if (this.moveAwayFrom) {
      args = [...args, parseMove('moveAwayFrom', this.moveAwayFrom)];
    }
    return `{${args.join(',')}}`;
  }
}

class GraphQLHybridSubSearchNearVector extends GraphQLHybridSubSearch {
  private vector: number[];
  private certainty?: number;
  private distance?: number;
  private targetVectors?: string[];

  constructor(args: NearVectorSubSearch) {
    super();
    this.vector = args.vector;
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.targetVectors = args.targetVectors;
  }

  toString(): string {
    let args = [`vector:${JSON.stringify(this.vector)}`];
    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }
    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }
    if (this.targetVectors && this.targetVectors.length > 0) {
      args = [...args, `targetVectors:${JSON.stringify(this.targetVectors)}`];
    }
    return `{${args.join(',')}}`;
  }
}

export default class GraphQLHybrid {
  private alpha?: number;
  private query: string;
  private vector?: number[];
  private properties?: string[];
  private targetVectors?: string[];
  private fusionType?: FusionType;
  private searches?: GraphQLHybridSubSearch[];

  constructor(args: HybridArgs) {
    this.alpha = args.alpha;
    this.query = args.query;
    this.vector = args.vector;
    this.properties = args.properties;
    this.targetVectors = args.targetVectors;
    this.fusionType = args.fusionType;
    this.searches = args.searches?.map((search) => GraphQLHybridSubSearch.fromArgs(search));
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

    if (this.searches !== undefined) {
      args = [...args, `searches:[${this.searches.map((search) => search.toString()).join(',')}]`];
    }

    return `{${args.join(',')}}`;
  }
}
