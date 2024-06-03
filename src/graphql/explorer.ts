import Connection from '../connection/index.js';
import { CommandBase } from '../validation/commandBase.js';
import Ask, { AskArgs } from './ask.js';
import NearImage, { NearImageArgs } from './nearImage.js';
import NearMedia, {
  NearAudioArgs,
  NearDepthArgs,
  NearIMUArgs,
  NearMediaArgs,
  NearMediaType,
  NearThermalArgs,
  NearVideoArgs,
} from './nearMedia.js';
import NearObject, { NearObjectArgs } from './nearObject.js';
import NearText, { NearTextArgs } from './nearText.js';
import NearVector, { NearVectorArgs } from './nearVector.js';

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

  private withNearMedia = (args: NearMediaArgs) => {
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

  withNearImage = (args: NearImageArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      this.nearMediaString = new NearImage(args).toString();
      this.nearMediaType = NearMediaType.Image;
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearAudio = (args: NearAudioArgs) => {
    return this.withNearMedia({ ...args, media: args.audio, type: NearMediaType.Audio });
  };

  withNearVideo = (args: NearVideoArgs) => {
    return this.withNearMedia({ ...args, media: args.video, type: NearMediaType.Video });
  };

  withNearDepth = (args: NearDepthArgs) => {
    return this.withNearMedia({ ...args, media: args.depth, type: NearMediaType.Depth });
  };

  withNearThermal = (args: NearThermalArgs) => {
    return this.withNearMedia({ ...args, media: args.thermal, type: NearMediaType.Thermal });
  };

  withNearIMU = (args: NearIMUArgs) => {
    return this.withNearMedia({ ...args, media: args.imu, type: NearMediaType.IMU });
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
