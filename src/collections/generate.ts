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
import { GenerateReturn, Properties } from './types';

export interface GenerateArgs<T extends Properties> {
  singlePrompt?: string;
  groupedTask?: string;
  groupedProperties?: (keyof T)[];
}

export interface GenerateFetchObjectsArgs<T extends Properties>
  extends QueryFetchObjectsArgs<T>,
    GenerateArgs<T> {}
export interface GenerateBm25Args<T extends Properties> extends QueryBm25Args<T>, GenerateArgs<T> {}
export interface GenerateHybridArgs<T extends Properties> extends QueryHybridArgs<T>, GenerateArgs<T> {}
export interface GenerateNearAudioArgs<T extends Properties> extends QueryNearAudioArgs<T>, GenerateArgs<T> {}
export interface GenerateNearImageArgs<T extends Properties> extends QueryNearImageArgs<T>, GenerateArgs<T> {}
export interface GenerateNearObjectArgs<T extends Properties>
  extends QueryNearObjectArgs<T>,
    GenerateArgs<T> {}
export interface GenerateNearTextArgs<T extends Properties> extends QueryNearTextArgs<T>, GenerateArgs<T> {}
export interface GenerateNearVectorArgs<T extends Properties>
  extends QueryNearVectorArgs<T>,
    GenerateArgs<T> {}
export interface GenerateNearVideoArgs<T extends Properties> extends QueryNearVideoArgs<T>, GenerateArgs<T> {}

class GenerateManager<T extends Properties> implements Generate<T> {
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
  ): GenerateManager<T> {
    return new GenerateManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public fetchObjects(args?: GenerateFetchObjectsArgs<T>): Promise<GenerateReturn<T>>;
  public fetchObjects<P extends Properties>(args?: GenerateFetchObjectsArgs<P>): Promise<GenerateReturn<P>>;
  public fetchObjects<P extends Properties>(args?: GenerateFetchObjectsArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withFetch({
          ...Serialize.fetchObjects(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public bm25(args: GenerateBm25Args<T>): Promise<GenerateReturn<T>>;
  public bm25<P extends Properties>(args: GenerateBm25Args<P>): Promise<GenerateReturn<P>>;
  public bm25<P extends Properties>(args: GenerateBm25Args<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withBm25({
          ...Serialize.bm25(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public hybrid(args: GenerateHybridArgs<T>): Promise<GenerateReturn<T>>;
  public hybrid<P extends Properties>(args: GenerateHybridArgs<P>): Promise<GenerateReturn<P>>;
  public hybrid<P extends Properties>(args: GenerateHybridArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withHybrid({
          ...Serialize.hybrid(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public nearAudio(args: GenerateNearAudioArgs<T>): Promise<GenerateReturn<T>>;
  public nearAudio<P extends Properties>(args: GenerateNearAudioArgs<P>): Promise<GenerateReturn<P>>;
  public nearAudio<P extends Properties>(args: GenerateNearAudioArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearAudio({
          ...Serialize.nearAudio(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public nearImage(args: GenerateNearImageArgs<T>): Promise<GenerateReturn<T>>;
  public nearImage<P extends Properties>(args: GenerateNearImageArgs<P>): Promise<GenerateReturn<P>>;
  public nearImage<P extends Properties>(args: GenerateNearImageArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearImage({
          ...Serialize.nearImage(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public nearObject(args: GenerateNearObjectArgs<T>): Promise<GenerateReturn<T>>;
  public nearObject<P extends Properties>(args: GenerateNearObjectArgs<P>): Promise<GenerateReturn<P>>;
  public nearObject<P extends Properties>(args: GenerateNearObjectArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearObject({
          ...Serialize.nearObject(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public nearText(args: GenerateNearTextArgs<T>): Promise<GenerateReturn<T>>;
  public nearText<P extends Properties>(args: GenerateNearTextArgs<P>): Promise<GenerateReturn<P>>;
  public nearText<P extends Properties>(args: GenerateNearTextArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearText({
          ...Serialize.nearText(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public nearVector(args: GenerateNearVectorArgs<T>): Promise<GenerateReturn<T>>;
  public nearVector<P extends Properties>(args: GenerateNearVectorArgs<P>): Promise<GenerateReturn<P>>;
  public nearVector<P extends Properties>(args: GenerateNearVectorArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearVector({
          ...Serialize.nearVector(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }

  public nearVideo(args: GenerateNearVideoArgs<T>): Promise<GenerateReturn<T>>;
  public nearVideo<P extends Properties>(args: GenerateNearVideoArgs<P>): Promise<GenerateReturn<P>>;
  public nearVideo<P extends Properties>(args: GenerateNearVideoArgs<P>): Promise<GenerateReturn<P>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearVideo({
          ...Serialize.nearVideo(args),
          generative: Serialize.generative(args),
        })
        .then(Deserialize.generate<P>)
    );
  }
}

export interface Generate<T extends Properties> {
  fetchObjects: (args?: GenerateFetchObjectsArgs<T>) => Promise<GenerateReturn<T>>;
  bm25: (args: GenerateBm25Args<T>) => Promise<GenerateReturn<T>>;
  hybrid: (args: GenerateHybridArgs<T>) => Promise<GenerateReturn<T>>;
  nearAudio: (args: GenerateNearAudioArgs<T>) => Promise<GenerateReturn<T>>;
  nearImage: (args: GenerateNearImageArgs<T>) => Promise<GenerateReturn<T>>;
  nearObject: (args: GenerateNearObjectArgs<T>) => Promise<GenerateReturn<T>>;
  nearText: (args: GenerateNearTextArgs<T>) => Promise<GenerateReturn<T>>;
  nearVector: (args: GenerateNearVectorArgs<T>) => Promise<GenerateReturn<T>>;
  nearVideo: (args: GenerateNearVideoArgs<T>) => Promise<GenerateReturn<T>>;
}

export default GenerateManager.use;
