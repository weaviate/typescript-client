export interface HybridArgs {
  alpha?: number;
  query: string;
  vector?: number[];
}

export default class GraphQLHybrid {
  private alpha?: number;
  private query: string;
  private vector?: number[];

  constructor(args: HybridArgs) {
    this.alpha = args.alpha;
    this.query = args.query;
    this.vector = args.vector;
  }

  toString() {
    let args = [`query:${JSON.stringify(this.query)}`]; // query must always be set

    if (this.alpha !== undefined) {
      args = [...args, `alpha:${JSON.stringify(this.alpha)}`];
    }

    if (this.vector !== undefined) {
      args = [...args, `vector:${JSON.stringify(this.vector)}`];
    }

    return `{${args.join(',')}}`;
  }
}
