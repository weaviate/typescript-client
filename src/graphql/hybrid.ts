import { isValidNumber, isValidNumberArray } from '../validation/number';
import { isValidStringProperty } from '../validation/string';

export default class GraphQLHybrid {
  private alpha?: number;
  private query?: string;
  private source: any;
  private vector?: number[];

  constructor(hybridObj: any) {
    this.source = hybridObj;
  }

  toString() {
    this.parse();
    this.validate();

    let args = [`query:${JSON.stringify(this.query)}`]; // query must always be set

    if (this.alpha !== undefined) {
      args = [...args, `alpha:${JSON.stringify(this.alpha)}`];
    }

    if (this.vector !== undefined) {
      args = [...args, `vector:${JSON.stringify(this.vector)}`];
    }

    return `{${args.join(',')}}`;
  }

  parse() {
    for (const key in this.source) {
      switch (key) {
        case 'query':
          this.parseQuery(this.source[key]);
          break;
        case 'alpha':
          this.parseAlpha(this.source[key]);
          break;
        case 'vector':
          this.parseVector(this.source[key]);
          break;
        default:
          throw new Error(`hybrid filter: unrecognized key '${key}'`);
      }
    }
  }

  parseQuery(query: string) {
    if (!isValidStringProperty(query)) {
      throw new Error('hybrid filter: query must be a string');
    }

    this.query = query;
  }

  parseAlpha(alpha: number) {
    if (!isValidNumber(alpha)) {
      throw new Error('hybrid filter: alpha must be a number');
    }

    this.alpha = alpha;
  }

  parseVector(vector: number[]) {
    if (!isValidNumberArray(vector) || vector.length == 0) {
      throw new Error('hybrid filter: vector must be an array of numbers');
    }

    this.vector = vector;
  }

  validate() {
    if (!this.query) {
      throw new Error('hybrid filter: query cannot be empty');
    }
  }
}
