import { ObjectQueryFields, parseProperties } from './types';

export interface AskArgs<P> {
  autocorrect?: boolean;
  certainty?: number;
  distance?: number;
  properties?: string[] | P;
  question?: string;
  rerank?: boolean;
}

export default class GraphQLAsk<P extends Record<string, any>> {
  private autocorrect?: boolean;
  private certainty?: number;
  private distance?: number;
  private properties?: string[];
  private question?: string;
  private rerank?: boolean;

  constructor(args: AskArgs<P>) {
    this.autocorrect = args.autocorrect;
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.properties = args.properties ? parseProperties(args.properties) : args.properties;
    this.question = args.question;
    this.rerank = args.rerank;
  }

  toString(wrap = true) {
    this.validate();

    let args: any[] = [];

    if (this.question) {
      args = [...args, `question:${JSON.stringify(this.question)}`];
    }

    if (this.properties) {
      args = [...args, `properties:${JSON.stringify(this.properties)}`];
    }

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (this.autocorrect !== undefined) {
      args = [...args, `autocorrect:${this.autocorrect}`];
    }

    if (this.rerank !== undefined) {
      args = [...args, `rerank:${this.rerank}`];
    }

    if (!wrap) {
      return `${args.join(',')}`;
    }
    return `{${args.join(',')}}`;
  }

  validate() {
    if (!this.question) {
      throw new Error('ask filter: question needs to be set');
    }
  }
}
