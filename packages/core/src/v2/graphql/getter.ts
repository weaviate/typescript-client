import Connection from '../../connection/index.js';
import { WhereFilter } from '../../openapi/types.js';
import { CommandBase } from '../../validation/commandBase.js';
import { ConsistencyLevel } from '../data/replication.js';
import Ask, { AskArgs } from './ask.js';
import Bm25, { Bm25Args } from './bm25.js';
import { GenerateArgs, GraphQLGenerate } from './generate.js';
import Group, { GroupArgs } from './group.js';
import GroupBy, { GroupByArgs } from './groupBy.js';
import Hybrid, { HybridArgs } from './hybrid.js';
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
import Sort, { SortArgs } from './sort.js';
import Where from './where.js';

export { FusionType } from './hybrid.js';
export default class GraphQLGetter extends CommandBase {
  private after?: string;
  private askString?: string;
  private bm25String?: string;
  private className?: string;
  private fields?: string;
  private groupString?: string;
  private hybridString?: string;
  private includesNearMediaFilter: boolean;
  private limit?: number;
  private nearImageNotSet?: boolean;
  private nearMediaString?: string;
  private nearMediaType?: NearMediaType;
  private nearObjectString?: string;
  private nearTextString?: string;
  private nearVectorString?: string;
  private offset?: number;
  private sortString?: string;
  private whereString?: string;
  private generateString?: string;
  private consistencyLevel?: ConsistencyLevel;
  private groupByString?: string;
  private tenant?: string;
  private autocut?: number;

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

  withAfter = (id: string) => {
    this.after = id;
    return this;
  };

  withGroup = (args: GroupArgs) => {
    try {
      this.groupString = new Group(args).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withWhere = (whereObj: WhereFilter) => {
    try {
      this.whereString = new Where(whereObj).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearText = (args: NearTextArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }

    this.nearTextString = new NearText(args).toString();
    this.includesNearMediaFilter = true;

    return this;
  };

  withBm25 = (args: Bm25Args) => {
    try {
      this.bm25String = new Bm25(args).toString();
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

  withAsk = (askObj: AskArgs) => {
    try {
      this.askString = new Ask(askObj).toString();
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
    return this.withNearMedia({
      ...args,
      type: NearMediaType.Audio,
      media: args.audio,
    });
  };

  withNearVideo = (args: NearVideoArgs) => {
    return this.withNearMedia({
      ...args,
      type: NearMediaType.Video,
      media: args.video,
    });
  };

  withNearThermal = (args: NearThermalArgs) => {
    return this.withNearMedia({
      ...args,
      type: NearMediaType.Thermal,
      media: args.thermal,
    });
  };

  withNearDepth = (args: NearDepthArgs) => {
    return this.withNearMedia({
      ...args,
      type: NearMediaType.Depth,
      media: args.depth,
    });
  };

  withNearIMU = (args: NearIMUArgs) => {
    return this.withNearMedia({
      ...args,
      type: NearMediaType.IMU,
      media: args.imu,
    });
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

  withLimit = (limit: number) => {
    this.limit = limit;
    return this;
  };

  withOffset = (offset: number) => {
    this.offset = offset;
    return this;
  };

  withAutocut = (autocut: number) => {
    this.autocut = autocut;
    return this;
  };

  withSort = (args: SortArgs[]) => {
    this.sortString = new Sort(args).toString();
    return this;
  };

  withGenerate = (args: GenerateArgs) => {
    this.generateString = new GraphQLGenerate(args).toString();
    return this;
  };

  withConsistencyLevel = (level: ConsistencyLevel) => {
    this.consistencyLevel = level;
    return this;
  };

  withGroupBy = (args: GroupByArgs) => {
    try {
      this.groupByString = new GroupBy(args).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withTenant = (tenant: string) => {
    this.tenant = tenant;
    return this;
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateIsSet(this.className, 'className', '.withClassName(className)');
    this.validateIsSet(this.fields, 'fields', '.withFields(fields)');
  };

  do = () => {
    let params = '';

    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

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

    if (this.askString) {
      args = [...args, `ask:${this.askString}`];
    }

    if (this.nearMediaString) {
      args = [...args, `near${this.nearMediaType}:${this.nearMediaString}`];
    }

    if (this.nearVectorString) {
      args = [...args, `nearVector:${this.nearVectorString}`];
    }

    if (this.bm25String) {
      args = [...args, `bm25:${this.bm25String}`];
    }

    if (this.hybridString) {
      args = [...args, `hybrid:${this.hybridString}`];
    }

    if (this.groupString) {
      args = [...args, `group:${this.groupString}`];
    }

    if (this.limit) {
      args = [...args, `limit:${this.limit}`];
    }

    if (this.offset) {
      args = [...args, `offset:${this.offset}`];
    }

    if (this.autocut) {
      args = [...args, `autocut:${this.autocut}`];
    }

    if (this.sortString) {
      args = [...args, `sort:[${this.sortString}]`];
    }

    if (this.after) {
      args = [...args, `after:"${this.after}"`];
    }

    if (this.generateString) {
      if (this.fields?.includes('_additional')) {
        this.fields.replace('_additional{', `_additional{${this.generateString}`);
      } else {
        this.fields = this.fields?.concat(` _additional{${this.generateString}}`);
      }
    }

    if (this.consistencyLevel) {
      args = [...args, `consistencyLevel:${this.consistencyLevel}`];
    }

    if (this.groupByString) {
      args = [...args, `groupBy:${this.groupByString}`];
    }

    if (this.tenant) {
      args = [...args, `tenant:"${this.tenant}"`];
    }

    if (args.length > 0) {
      params = `(${args.join(',')})`;
    }

    return this.client.query(`{Get{${this.className}${params}{${this.fields}}}}`);
  };
}
