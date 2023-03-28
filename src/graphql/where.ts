import { WhereFilter } from '../openapi/types';

export default class GraphQLWhere {
  private operands?: string;
  private operator?: string;
  private path?: string[];
  private readonly source: any;
  private valueContent: any;
  private valueType?: string;

  constructor(whereObj: WhereFilter) {
    this.source = whereObj;
  }

  toString() {
    this.parse();
    this.validate();
    if (this.operands) {
      return `{operator:${this.operator},operands:[${this.operands}]}`;
    } else {
      // this is an on-value filter

      const valueContent = this.marshalValueContent();
      return (
        `{` +
        `operator:${this.operator},` +
        `${this.valueType}:${valueContent},` +
        `path:${JSON.stringify(this.path)}` +
        `}`
      );
    }
  }

  marshalValueContent() {
    if (this.valueType == 'valueGeoRange') {
      return this.marshalValueGeoRange();
    }

    return JSON.stringify(this.valueContent);
  }

  marshalValueGeoRange() {
    let parts: any[] = [];

    const gc = this.valueContent.geoCoordinates;
    if (gc) {
      let gcParts: any[] = [];

      if (gc.latitude) {
        gcParts = [...gcParts, `latitude:${gc.latitude}`];
      }

      if (gc.longitude) {
        gcParts = [...gcParts, `longitude:${gc.longitude}`];
      }
      parts = [...parts, `geoCoordinates:{${gcParts.join(',')}}`];
    }

    const d = this.valueContent.distance;
    if (d) {
      let dParts: any[] = [];
      if (d.max) {
        dParts = [...dParts, `max:${d.max}`];
      }

      parts = [...parts, `distance:{${dParts.join(',')}}`];
    }

    return `{${parts.join(',')}}`;
  }

  validate() {
    if (!this.operator) {
      throw new Error('where filter: operator cannot be empty');
    }

    if (!this.operands) {
      if (!this.valueType) {
        throw new Error('where filter: value<Type> cannot be empty');
      }

      if (!this.path) {
        throw new Error('where filter: path cannot be empty');
      }
    }
  }

  parse() {
    for (const key in this.source) {
      switch (key) {
        case 'operator':
          this.parseOperator(this.source[key]);
          break;
        case 'operands':
          this.parseOperands(this.source[key]);
          break;
        case 'path':
          this.parsePath(this.source[key]);
          break;
        default:
          if (key.indexOf('value') != 0) {
            throw new Error("where filter: unrecognized key '" + key + "'");
          }
          this.parseValue(key, this.source[key]);
      }
    }
  }

  parseOperator(op: string) {
    if (typeof op !== 'string') {
      throw new Error('where filter: operator must be a string');
    }

    this.operator = op;
  }

  parsePath(path: string[]) {
    if (!Array.isArray(path)) {
      throw new Error('where filter: path must be an array');
    }

    this.path = path;
  }

  parseValue(key: string, value: any) {
    switch (key) {
      case 'valueString':
      case 'valueText':
      case 'valueInt':
      case 'valueNumber':
      case 'valueDate':
      case 'valueBoolean':
      case 'valueGeoRange':
        break;
      default:
        throw new Error("where filter: unrecognized value prop '" + key + "'");
    }
    this.valueType = key;
    this.valueContent = value;
  }

  parseOperands(ops: any[]) {
    if (!Array.isArray(ops)) {
      throw new Error('where filter: operands must be an array');
    }

    this.operands = ops
      .map((element) => {
        return new GraphQLWhere(element).toString();
      })
      .join(',');
  }
}
