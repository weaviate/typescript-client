export interface Bm25Args {
  properties?: string[];
  query: string;
}

export default class GraphQLBm25 {
  private properties?: string[];
  private query: string;

  constructor(args: Bm25Args) {
    this.properties = args.properties;
    this.query = args.query;
  }

  toString() {
    let args = [`query:${JSON.stringify(this.query)}`]; // query must always be set

    if (this.properties !== undefined) {
      args = [...args, `properties:${JSON.stringify(this.properties)}`];
    }

    return `{${args.join(',')}}`;
  }
}
