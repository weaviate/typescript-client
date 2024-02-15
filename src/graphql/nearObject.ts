export interface NearObjectArgs {
  beacon?: string;
  certainty?: number;
  distance?: number;
  id?: string;
  targetVectors?: string[];
}

export default class GraphQLNearObject {
  private beacon?: string;
  private certainty?: number;
  private distance?: number;
  private id?: string;
  private targetVectors?: string[];

  constructor(args: NearObjectArgs) {
    this.beacon = args.beacon;
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.id = args.id;
    this.targetVectors = args.targetVectors;
  }

  toString(wrap = true) {
    this.validate();

    let args: any[] = [];

    if (this.id) {
      args = [...args, `id:${JSON.stringify(this.id)}`];
    }

    if (this.beacon) {
      args = [...args, `beacon:${JSON.stringify(this.beacon)}`];
    }

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (this.targetVectors && this.targetVectors.length > 0) {
      args = [...args, `targetVectors:${JSON.stringify(this.targetVectors)}`];
    }

    if (!wrap) {
      return `${args.join(',')}`;
    }
    return `{${args.join(',')}}`;
  }

  validate() {
    if (!this.id && !this.beacon) {
      throw new Error('nearObject filter: id or beacon needs to be set');
    }
  }
}
