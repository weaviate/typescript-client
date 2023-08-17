import { isValidStringArray, isValidStringProperty } from '../validation/string';
import { ObjectQueryFields, parseProperties } from './types';

export interface Bm25Args<P> {
  properties?: string[] | P;
  query: string;
}

export default class GraphQLBm25<P extends Record<string, any>> {
  private properties?: string[];
  private query: string;

  constructor(args: Bm25Args<ObjectQueryFields<P>>) {
    this.properties = args.properties ? parseProperties(args.properties) : args.properties;
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
