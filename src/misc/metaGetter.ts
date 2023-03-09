import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class MetaGetter extends CommandBase {

  constructor(client: Connection) {
    super(client)
  }

  validate() {
    // nothing to validate
  }

  do = () => {
    return this.client.get("/meta", true);
  };
}
