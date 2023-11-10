import Connection from '../connection';

import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import Deserialize from './deserialize';
import Serialize from './serialize';

import {
  QueryFetchObjectsArgs,
  QueryBm25Args,
  QueryHybridArgs,
  QueryNearAudioArgs,
  QueryNearImageArgs,
  QueryNearObjectArgs,
  QueryNearTextArgs,
  QueryNearVectorArgs,
  QueryNearVideoArgs,
} from './query';
import { GroupByReturn, Properties } from './types';

export interface GroupByArgs<T extends Properties> {
  groupByProperty: keyof T;
  numberOfGroups: number;
  objectsPerGroup: number;
}

export interface GroupByFetchObjectsArgs<T extends Properties>
  extends QueryFetchObjectsArgs<T>,
    GroupByArgs<T> {}
export interface GroupByBm25Args<T extends Properties> extends QueryBm25Args<T>, GroupByArgs<T> {}
export interface GroupByHybridArgs<T extends Properties> extends QueryHybridArgs<T>, GroupByArgs<T> {}
export interface GroupByNearAudioArgs<T extends Properties> extends QueryNearAudioArgs<T>, GroupByArgs<T> {}
export interface GroupByNearImageArgs<T extends Properties> extends QueryNearImageArgs<T>, GroupByArgs<T> {}
export interface GroupByNearObjectArgs<T extends Properties> extends QueryNearObjectArgs<T>, GroupByArgs<T> {}
export interface GroupByNearTextArgs<T extends Properties> extends QueryNearTextArgs<T>, GroupByArgs<T> {}
export interface GroupByNearVectorArgs<T extends Properties> extends QueryNearVectorArgs<T>, GroupByArgs<T> {}
export interface GroupByNearVideoArgs<T extends Properties> extends QueryNearVideoArgs<T>, GroupByArgs<T> {}

class GroupByManager<T extends Properties> implements GroupBy<T> {
  connection: Connection;
  name: string;
  dbVersionSupport: DbVersionSupport;
  consistencyLevel?: ConsistencyLevel;
  tenant?: string;

  private constructor(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.name = name;
    this.dbVersionSupport = dbVersionSupport;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;
  }

  public static use<T extends Properties>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): GroupByManager<T> {
    return new GroupByManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  // public fetchObjects(args?: GroupByFetchObjectsArgs<T>): Promise<GroupByReturn<T>>;
  // public fetchObjects<P extends Properties>(args?: GroupByFetchObjectsArgs<P>): Promise<GroupByReturn<P>>;
  // public fetchObjects<P extends Properties>(args?: GroupByFetchObjectsArgs<P>): Promise<GroupByReturn<P>> {
  //   return this.connection.search(this.name).then((search) =>
  //     search
  //       .withFetch({
  //         ...Serialize.fetchObjects(args),
  //         groupBy: Serialize.groupBy(args),
  //       })
  //       .then(Deserialize.groupBy<P>)
  //   );
  // }

  // public bm25(args: GroupByBm25Args<T>): Promise<GroupByReturn<T>>;
  // public bm25<P extends Properties>(args: GroupByBm25Args<P>): Promise<GroupByReturn<P>>;
  // public bm25<P extends Properties>(args: GroupByBm25Args<P>): Promise<GroupByReturn<P>> {
  //   return this.connection.search(this.name).then((search) =>
  //     search
  //       .withBm25({
  //         ...Serialize.bm25(args),
  //         groupBy: Serialize.groupBy(args),
  //       })
  //       .then(Deserialize.groupBy<P>)
  //   );
  // }

  // public hybrid(args: GroupByHybridArgs<T>): Promise<GroupByReturn<T>>;
  // public hybrid<P extends Properties>(args: GroupByHybridArgs<P>): Promise<GroupByReturn<P>>;
  // public hybrid<P extends Properties>(args: GroupByHybridArgs<P>): Promise<GroupByReturn<P>> {
  //   return this.connection.search(this.name).then((search) =>
  //     search
  //       .withHybrid({
  //         ...Serialize.hybrid(args),
  //         groupBy: Serialize.groupBy(args),
  //       })
  //       .then(Deserialize.groupBy<P>)
  //   );
  // }

  public nearAudio(args: GroupByNearAudioArgs<T>): Promise<GroupByReturn<T>>;
  public nearAudio<P extends Properties>(args: GroupByNearAudioArgs<P>): Promise<GroupByReturn<P>>;
  public nearAudio<P extends Properties>(args: GroupByNearAudioArgs<P>): Promise<GroupByReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearAudio({
          ...Serialize.nearAudio(args),
          groupBy: Serialize.groupBy(args),
        })
        .then(Deserialize.groupBy<P>)
    );
  }

  public nearImage(args: GroupByNearImageArgs<T>): Promise<GroupByReturn<T>>;
  public nearImage<P extends Properties>(args: GroupByNearImageArgs<P>): Promise<GroupByReturn<P>>;
  public nearImage<P extends Properties>(args: GroupByNearImageArgs<P>): Promise<GroupByReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearImage({
          ...Serialize.nearImage(args),
          groupBy: Serialize.groupBy(args),
        })
        .then(Deserialize.groupBy<P>)
    );
  }

  public nearObject(args: GroupByNearObjectArgs<T>): Promise<GroupByReturn<T>>;
  public nearObject<P extends Properties>(args: GroupByNearObjectArgs<P>): Promise<GroupByReturn<P>>;
  public nearObject<P extends Properties>(args: GroupByNearObjectArgs<P>): Promise<GroupByReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearObject({
          ...Serialize.nearObject(args),
          groupBy: Serialize.groupBy(args),
        })
        .then(Deserialize.groupBy<P>)
    );
  }

  public nearText(args: GroupByNearTextArgs<T>): Promise<GroupByReturn<T>>;
  public nearText<P extends Properties>(args: GroupByNearTextArgs<P>): Promise<GroupByReturn<P>>;
  public nearText<P extends Properties>(args: GroupByNearTextArgs<P>): Promise<GroupByReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearText({
          ...Serialize.nearText(args),
          groupBy: Serialize.groupBy(args),
        })
        .then(Deserialize.groupBy<P>)
    );
  }

  public nearVector(args: GroupByNearVectorArgs<T>): Promise<GroupByReturn<T>>;
  public nearVector<P extends Properties>(args: GroupByNearVectorArgs<P>): Promise<GroupByReturn<P>>;
  public nearVector<P extends Properties>(args: GroupByNearVectorArgs<P>): Promise<GroupByReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearVector({
          ...Serialize.nearVector(args),
          groupBy: Serialize.groupBy(args),
        })
        .then(Deserialize.groupBy<P>)
    );
  }

  public nearVideo(args: GroupByNearVideoArgs<T>): Promise<GroupByReturn<T>>;
  public nearVideo<P extends Properties>(args: GroupByNearVideoArgs<P>): Promise<GroupByReturn<P>>;
  public nearVideo<P extends Properties>(args: GroupByNearVideoArgs<P>): Promise<GroupByReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearVideo({
          ...Serialize.nearVideo(args),
          groupBy: Serialize.groupBy(args),
        })
        .then(Deserialize.groupBy<P>)
    );
  }
}

export interface GroupBy<T extends Properties> {
  // fetchObjects: (args?: GroupByFetchObjectsArgs<T>) => Promise<GroupByReturn<T>>;
  // bm25: (args: GroupByBm25Args<T>) => Promise<GroupByReturn<T>>;
  // hybrid: (args: GroupByHybridArgs<T>) => Promise<GroupByReturn<T>>;
  nearAudio: (args: GroupByNearAudioArgs<T>) => Promise<GroupByReturn<T>>;
  nearImage: (args: GroupByNearImageArgs<T>) => Promise<GroupByReturn<T>>;
  nearObject: (args: GroupByNearObjectArgs<T>) => Promise<GroupByReturn<T>>;
  nearText: (args: GroupByNearTextArgs<T>) => Promise<GroupByReturn<T>>;
  nearVector: (args: GroupByNearVectorArgs<T>) => Promise<GroupByReturn<T>>;
  nearVideo: (args: GroupByNearVideoArgs<T>) => Promise<GroupByReturn<T>>;
}

export default GroupByManager.use;
