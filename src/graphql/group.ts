export default class GraphQLGroup {
  private source: any;
  
  constructor(source: any) {
    this.source = source;
  }

  toString() {
    let parts: any[] = [];

    if (this.source.type) {
      // value is a graphQL enum, so doesn't need to be quoted
      parts = [...parts, `type:${this.source.type}`];
    }

    if (this.source.force) {
      parts = [...parts, `force:${this.source.force}`];
    }

    return `{${parts.join(",")}}`;
  }
}
