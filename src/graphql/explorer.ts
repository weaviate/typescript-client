import NearText, { NearTextArgs } from './nearText';
import NearVector, { NearVectorArgs } from './nearVector';
import NearObject, { NearObjectArgs } from './nearObject';
import NearMedia, { NearImageArgs, NearMediaArgs, NearMediaType } from './nearMedia';
import Ask, { AskArgs } from './ask';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';

export default class Explorer extends CommandBase {
  private askString?: string;
  private fields?: string;
  private group?: string[];
  private limit?: number;
  private includesNearMediaFilter: boolean;
  private nearMediaString?: string;
  private nearMediaType?: NearMediaType;
  private nearObjectString?: string;
  private nearTextString?: string;
  private nearVectorString?: string;
  private params: Record<string, any>;

  constructor(client: Connection) {
    super(client);
    this.params = {};
    this.includesNearMediaFilter = false;
  }

  withFields = (fields: string) => {
    this.fields = fields;
    return this;
  };

  withLimit = (limit: number) => {
    this.limit = limit;
    return this;
  };

  withNearText = (args: NearTextArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      this.nearTextString = new NearText(args).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearObject = (args: NearObjectArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      this.nearObjectString = new NearObject(args).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withAsk = (args: AskArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      this.askString = new Ask(args).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearImage = (args: NearImageArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      if (!args.image) {
        throw new Error('nearImage filter: image field must be present');
      }
      this.nearMediaString = new NearMedia({
        certainty: args.certainty,
        distance: args.distance,
        media: args.image,
        type: NearMediaType.Image,
      }).toString();
      this.nearMediaType = NearMediaType.Image;
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearMedia = (args: NearMediaArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      this.nearMediaString = new NearMedia(args).toString();
      this.nearMediaType = args.type;
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearVector = (args: NearVectorArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      this.nearVectorString = new NearVector(args).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  validateGroup = () => {
    if (!this.group) {
      // nothing to check if this optional parameter is not set
      return;
    }

    if (!Array.isArray(this.group)) {
      throw new Error('groupBy must be an array');
    }
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateIsSet(this.fields, 'fields', '.withFields(fields)');
  };

  do = (): Promise<any> => {
    let params = '';

    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    let args: string[] = [];

    if (this.nearTextString) {
      args = [...args, `nearText:${this.nearTextString}`];
    }

    if (this.nearObjectString) {
      args = [...args, `nearObject:${this.nearObjectString}`];
    }

    if (this.askString) {
      args = [...args, `ask:${this.askString}`];
    }

    if (this.nearMediaString) {
      args = [...args, `${this.nearMediaType}:${this.nearMediaString}`];
    }

    if (this.nearVectorString) {
      args = [...args, `nearVector:${this.nearVectorString}`];
    }

    if (this.limit) {
      args = [...args, `limit:${this.limit}`];
    }

    params = `(${args.join(',')})`;

    return this.client.query(`{Explore${params}{${this.fields}}}`);
  };
}
