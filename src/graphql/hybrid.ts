export interface HybridArgs {
  alpha?: number;
  query: string;
  vector?: number[];
  properties?: string[];
}

export default class GraphQLHybrid {
  private alpha?: number;
  private query: string;
  private vector?: number[];
  private properties?: string[];

  constructor(args: HybridArgs) {
    this.alpha = args.alpha;
    this.query = args.query;
    this.vector = args.vector;
    this.properties = args.properties;
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
      const props = this.properties.join('","');
      args = [...args, `properties:["${props}"]`];
    }

    return `{${args.join(',')}}`;
  }
}
