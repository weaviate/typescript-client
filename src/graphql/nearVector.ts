export interface NearVectorArgs {
  certainty?: number;
  distance?: number;
  vector: number[];
}

export default class GraphQLNearVector {
  private certainty?: number;
  private distance?: number;
  private vector: number[];

  constructor(args: NearVectorArgs) {
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.vector = args.vector;
  }

  toString(wrap = true) {
    let args = [`vector:${JSON.stringify(this.vector)}`]; // vector must always be set

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (!wrap) {
      return `${args.join(',')}`;
    }
    return `{${args.join(',')}}`;
  }
}
