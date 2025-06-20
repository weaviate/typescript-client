import Connection from '../../connection/index.js';
import { WhereFilter } from '../../openapi/types.js';
import { CommandBase } from '../../validation/commandBase.js';
import { isValidPositiveIntProperty } from '../../validation/number.js';
import Hybrid, { HybridArgs } from './hybrid.js';
import NearMedia, {
  NearAudioArgs,
  NearDepthArgs,
  NearIMUArgs,
  NearMediaArgs,
  NearMediaBase,
  NearMediaType,
  NearVideoArgs,
} from './nearMedia.js';
import NearObject, { NearObjectArgs } from './nearObject.js';
import NearText, { NearTextArgs } from './nearText.js';
import NearVector, { NearVectorArgs } from './nearVector.js';
import Where from './where.js';

interface NearImageArgs extends NearMediaBase {
  image: string;
}

export default class Aggregator extends CommandBase {
  private className?: string;
  private fields?: string;
  private groupBy?: string[];
  private hybridString?: string;
  private includesNearMediaFilter: boolean;
  private limit?: number;
  private nearMediaString?: string;
  private nearMediaType?: string;
  private nearObjectString?: string;
  private nearTextString?: string;
  private nearVectorString?: string;
  private objectLimit?: number;
  private whereString?: string;
  private tenant?: string;

  constructor(client: Connection) {
    super(client);
    this.includesNearMediaFilter = false;
  }

  withFields = (fields: string) => {
    this.fields = fields;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withWhere = (where: WhereFilter) => {
    try {
      this.whereString = new Where(where).toString();
    } catch (e: any) {
      this.addError(e as string);
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
    return this.withNearMedia({ ...args, media: args.image, type: NearMediaType.Image });
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

  withNearIMU = (args: NearIMUArgs) => {
    return this.withNearMedia({ ...args, media: args.imu, type: NearMediaType.IMU });
  };

  withNearText = (args: NearTextArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }
    try {
      this.nearTextString = new NearText(args).toString();
      this.includesNearMediaFilter = true;
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
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withHybrid = (args: HybridArgs) => {
    try {
      this.hybridString = new Hybrid(args).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withObjectLimit = (objectLimit: number) => {
    if (!isValidPositiveIntProperty(objectLimit)) {
      throw new Error('objectLimit must be a non-negative integer');
    }
    this.objectLimit = objectLimit;
    return this;
  };

  withLimit = (limit: number) => {
    this.limit = limit;
    return this;
  };

  withGroupBy = (groupBy: string[]) => {
    this.groupBy = groupBy;
    return this;
  };

  withTenant = (tenant: string) => {
    this.tenant = tenant;
    return this;
  };

  validateGroup = () => {
    if (!this.groupBy) {
      // nothing to check if this optional parameter is not set
      return;
    }

    if (!Array.isArray(this.groupBy)) {
      throw new Error('groupBy must be an array');
    }
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateGroup();
    this.validateIsSet(this.className, 'className', '.withClassName(className)');
    this.validateIsSet(this.fields, 'fields', '.withFields(fields)');
  };

  do = () => {
    let params = '';

    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    if (
      this.whereString ||
      this.nearTextString ||
      this.nearObjectString ||
      this.nearVectorString ||
      this.limit ||
      this.groupBy ||
      this.hybridString ||
      this.tenant
    ) {
      let args: string[] = [];

      if (this.whereString) {
        args = [...args, `where:${this.whereString}`];
      }

      if (this.nearTextString) {
        args = [...args, `nearText:${this.nearTextString}`];
      }

      if (this.nearObjectString) {
        args = [...args, `nearObject:${this.nearObjectString}`];
      }

      if (this.nearVectorString) {
        args = [...args, `nearVector:${this.nearVectorString}`];
      }

      if (this.nearMediaString) {
        args = [...args, `${this.nearMediaType}:${this.nearMediaString}`];
      }

      if (this.groupBy) {
        args = [...args, `groupBy:${JSON.stringify(this.groupBy)}`];
      }

      if (this.hybridString) {
        args = [...args, `hybrid:${this.hybridString}`];
      }

      if (this.limit) {
        args = [...args, `limit:${this.limit}`];
      }

      if (this.objectLimit) {
        args = [...args, `objectLimit:${this.objectLimit}`];
      }

      if (this.tenant) {
        args = [...args, `tenant:"${this.tenant}"`];
      }

      params = `(${args.join(',')})`;
    }
    return this.client.query(`{Aggregate{${this.className}${params}{${this.fields}}}}`);
  };
}
