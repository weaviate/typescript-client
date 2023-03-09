export default class NodesStatusGetter {

  constructor(client) {
    this.client = client;
  }

  do() {
    return this.client.get("/nodes");
  };
}
