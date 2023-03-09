export default class GraphQLAsk {
  private autocorrect?: boolean;
  private certainty?: number;
  private distance?: number;
  private properties?: string[];
  private question?: string;
  private rerank?: boolean;
  private source: any;

  constructor(askObj: any) {
    this.source = askObj;
  }

  toString(wrap = true) {
    this.parse();
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
      return `${args.join(",")}`;
    }
    return `{${args.join(",")}}`;
  }

  validate() {
    if (!this.question) {
      throw new Error("ask filter: question needs to be set");
    }
  }

  parse() {
    for (let key in this.source) {
      switch (key) {
        case "question":
          this.parseQuestion(this.source[key]);
          break;
        case "properties":
          this.parseProperties(this.source[key]);
          break;
        case "certainty":
          this.parseCertainty(this.source[key]);
          break;
        case "distance":
          this.parseDistance(this.source[key]);
          break;
        case "autocorrect":
          this.parseAutocorrect(this.source[key]);
          break;
        case "rerank":
          this.parseRerank(this.source[key]);
          break;
        default:
          throw new Error("ask filter: unrecognized key '" + key + "'");
      }
    }
  }

  parseQuestion(question: string) {
    if (typeof question !== "string") {
      throw new Error("ask filter: question must be a string");
    }

    this.question = question;
  }

  parseProperties(properties: any[]) {
    if (!Array.isArray(properties)) {
      throw new Error("ask filter: properties must be an array");
    }

    this.properties = properties;
  }

  parseCertainty(cert: number) {
    if (typeof cert !== "number") {
      throw new Error("ask filter: certainty must be a number");
    }

    this.certainty = cert;
  }

  parseDistance(dist: number) {
    if (typeof dist !== "number") {
      throw new Error("ask filter: distance must be a number");
    }

    this.distance = dist;
  }

  parseAutocorrect(autocorrect: boolean) {
    if (typeof autocorrect !== "boolean") {
      throw new Error("ask filter: autocorrect must be a boolean");
    }

    this.autocorrect = autocorrect;
  }

  parseRerank(rerank: boolean) {
    if (typeof rerank !== "boolean") {
      throw new Error("ask filter: rerank must be a boolean");
    }

    this.rerank = rerank;
  }
}
