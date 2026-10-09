export interface GroupArgs {
  type: string;
  force: number;
}

export default class GraphQLGroup {
  private args: GroupArgs;

  constructor(args: GroupArgs) {
    this.args = args;
  }

  toString() {
    let parts: any[] = [];

    if (this.args.type) {
      // value is a graphQL enum, so doesn't need to be quoted
      parts = [...parts, `type:${this.args.type}`];
    }

    if (this.args.force) {
      parts = [...parts, `force:${this.args.force}`];
    }

    return `{${parts.join(',')}}`;
  }
}
