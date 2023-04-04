import Where from './where';
import NearText, { NearTextArgs } from './nearText';
import NearVector, { NearVectorArgs } from './nearVector';
import Bm25, { Bm25Args } from './bm25';
import Hybrid, { HybridArgs } from './hybrid';
import NearObject, { NearObjectArgs } from './nearObject';
import NearImage, { NearImageArgs } from './nearImage';
import Ask, { AskArgs } from './ask';
import Group, { GroupArgs } from './group';
import Sort, { SortArgs } from './sort';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { WhereFilter } from '../openapi/types';
import { GenerateArgs, GraphQLGenerate } from './generate';

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
  private nearImageString?: string;
  private nearObjectString?: string;
  private nearTextString?: string;
  private nearVectorString?: string;
  private offset?: number;
  private sortString?: string;
  private whereString?: string;
  private generateString?: string;

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

  withNearImage = (args: NearImageArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }

    try {
      this.nearImageString = new NearImage(args).toString();
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

  withLimit = (limit: number) => {
    this.limit = limit;
    return this;
  };

  withOffset = (offset: number) => {
    this.offset = offset;
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

    if (this.nearImageString) {
      args = [...args, `nearImage:${this.nearImageString}`];
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

    if (args.length > 0) {
      params = `(${args.join(',')})`;
    }

    return this.client.query(`{Get{${this.className}${params}{${this.fields}}}}`);
  };
}
