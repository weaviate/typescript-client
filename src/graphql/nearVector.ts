export default class GraphQLNearVector {
  private certainty?: number;
  private distance?: number;
  private readonly source: any;
  private vector?: number[];

  constructor(nearVectorObj: any) {
    this.source = nearVectorObj;
  }

  toString(wrap = true) {
    this.parse();
    this.validate();

    let args = [`vector:${JSON.stringify(this.vector)}`]; // vector must always be set

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (!wrap) {
      return `${args.join(",")}`;
    }
    return `{${args.join(",")}}`;
  }

  validate() {
    if (!this.vector) {
      throw new Error("nearVector filter: vector cannot be empty");
    }
  }

  parse() {
    for (let key in this.source) {
      switch (key) {
        case "vector":
          this.parseVector(this.source[key]);
          break;
        case "certainty":
          this.parseCertainty(this.source[key]);
          break;
        case "distance":
          this.parseDistance(this.source[key]);
          break;
        default:
          throw new Error("nearVector filter: unrecognized key '" + key + "'");
      }
    }
  }

  parseVector(vector: any[]) {
    if (!Array.isArray(vector)) {
      throw new Error("nearVector filter: vector must be an array");
    }

    vector.forEach((elem: any) => {
      if (typeof elem !== "number") {
        throw new Error("nearVector filter: vector elements must be a number");
      }
    });

    this.vector = vector;
  }

  parseCertainty(cert: number) {
    if (typeof cert !== "number") {
      throw new Error("nearVector filter: certainty must be a number");
    }

    this.certainty = cert;
  }

  parseDistance(dist: number) {
    if (typeof dist !== "number") {
      throw new Error("nearVector filter: distance must be a number");
    }

    this.distance = dist;
  }
}
