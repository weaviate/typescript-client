import Where from './where';
import NearText from './nearText';
import NearVector from './nearVector';
import Bm25 from './bm25';
import Hybrid from './hybrid';
import NearObject from './nearObject';
import NearImage from './nearImage';
import Ask from './ask';
import Group from './group';
import Sort from './sort';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';

export default class Getter extends CommandBase {
  private after?: string;
  private askString?: string;
  private bm25String?: string;
  private className?: string;
  private fields: any;
  private groupString?: string;
  private hybridString?: string;
  private includesNearMediaFilter: boolean;
  private limit: any;
  private nearImageString?: string;
  private nearObjectString?: string;
  private nearTextString?: string;
  private nearVectorString?: string;
  private offset: any;
  private sortString?: string;
  private whereString?: string;

  constructor(client: Connection) {
    super(client);
    this.includesNearMediaFilter = false;
  }

  withFields = (fields: any) => {
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

  withGroup = (groupObj: any) => {
    try {
      this.groupString = new Group(groupObj).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withWhere = (whereObj: any) => {
    try {
      this.whereString = new Where(whereObj).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearText = (nearTextObj: any) => {
    if (this.includesNearMediaFilter) {
      throw new Error(
        'cannot use multiple near<Media> filters in a single query'
      );
    }

    try {
      this.nearTextString = new NearText(nearTextObj).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withBm25 = (bm25Obj: any) => {
    try {
      this.bm25String = new Bm25(bm25Obj).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withHybrid = (hybridObj: any) => {
    try {
      this.hybridString = new Hybrid(hybridObj).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withNearObject = (nearObjectObj: any) => {
    if (this.includesNearMediaFilter) {
      throw new Error(
        'cannot use multiple near<Media> filters in a single query'
      );
    }

    try {
      this.nearObjectString = new NearObject(nearObjectObj).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withAsk = (askObj: any) => {
    try {
      this.askString = new Ask(askObj).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  withNearImage = (nearImageObj: any) => {
    if (this.includesNearMediaFilter) {
      throw new Error(
        'cannot use multiple near<Media> filters in a single query'
      );
    }

    try {
      this.nearImageString = new NearImage(nearImageObj).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withNearVector = (nearVectorObj: any) => {
    if (this.includesNearMediaFilter) {
      throw new Error(
        'cannot use multiple near<Media> filters in a single query'
      );
    }

    try {
      this.nearVectorString = new NearVector(nearVectorObj).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withLimit = (limit: any) => {
    this.limit = limit;
    return this;
  };

  withOffset = (offset: any) => {
    this.offset = offset;
    return this;
  };

  withSort = (sortObj: any) => {
    try {
      this.sortString = new Sort(sortObj).toString();
    } catch (e: any) {
      this.addError(e.toString());
    }
    return this;
  };

  validateIsSet = (
    prop: string | undefined | null,
    name: string,
    setter: string
  ) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateIsSet(
      this.className,
      'className',
      '.withClassName(className)'
    );
    this.validateIsSet(this.fields, 'fields', '.withFields(fields)');
  };

  do = () => {
    let params = '';

    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error('invalid usage: ' + this.errors.join(', '))
      );
    }

    let args: any[] = [];

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

    if (args.length > 0) {
      params = `(${args.join(',')})`;
    }

    return this.client.query(
      `{Get{${this.className}${params}{${this.fields}}}}`
    );
  };
}
