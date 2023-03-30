export interface SortArgs {
  path: string[];
  order?: string;
}

export type SortOrder = 'asc' | 'desc';

export default class GraphQLSort {
  private args: SortArgs[];

  constructor(args: SortArgs[]) {
    this.args = args;
  }

  toString(): string {
    const parts: string[] = [];

    for (const arg of this.args) {
      let part = `{path:${JSON.stringify(arg.path)}`;
      if (arg.order) {
        part = part.concat(`,order:${arg.order}}`);
      } else {
        part = part.concat('}');
      }
      parts.push(part);
    }

    return parts.join(',');
  }
}
