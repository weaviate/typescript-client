import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class NodesStatusGetter extends CommandBase {

  constructor(client: Connection) {
    super(client)
  }

  validate() {
    //nothing to validate
  }

  do() {
    return this.client.get("/nodes");
  };
}
