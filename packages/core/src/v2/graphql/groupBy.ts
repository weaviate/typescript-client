export interface GroupByArgs {
  path: string[];
  groups: number;
  objectsPerGroup: number;
}

export default class GraphQLGroupBy {
  private args: GroupByArgs;

  constructor(args: GroupByArgs) {
    this.args = args;
  }

  toString() {
    let parts: string[] = [];

    if (this.args.path) {
      parts = [...parts, `path:${JSON.stringify(this.args.path)}`];
    }

    if (this.args.groups) {
      parts = [...parts, `groups:${this.args.groups}`];
    }

    if (this.args.objectsPerGroup) {
      parts = [...parts, `objectsPerGroup:${this.args.objectsPerGroup}`];
    }

    return `{${parts.join(',')}}`;
  }
}
