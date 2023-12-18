import { Properties, ReferencesType, WeaviateObject } from './types';

interface ReferenceToArgs {
  uuids: string | string[];
}

interface ReferenceToMultiTargetArgs extends ReferenceToArgs {
  targetCollection: string;
}

export type Beacon = {
  beacon: string;
};

export class ReferenceManager<T extends Properties, U extends ReferencesType> {
  public objects: WeaviateObject<T, U>[];
  public targetCollection: string;
  public uuids?: string[];

  constructor(targetCollection: string, objects?: WeaviateObject<T, U>[], uuids?: string[]) {
    this.objects = objects ?? [];
    this.targetCollection = targetCollection;
    this.uuids = uuids;
  }

  public toBeaconObjs(): Beacon[] {
    return this.uuids
      ? this.uuids.map((uuid) => {
          return {
            beacon: `weaviate://localhost/${this.targetCollection ? `${this.targetCollection}/` : ''}${uuid}`,
          };
        })
      : [];
  }

  public toBeaconStrings(): string[] {
    return this.uuids
      ? this.uuids.map((uuid) => {
          return `weaviate://localhost/${this.targetCollection ? `${this.targetCollection}/` : ''}${uuid}`;
        })
      : [];
  }

  static fromBeaconStrings<T extends Properties, U extends ReferencesType>(
    beacons: string[]
  ): ReferenceManager<T, U> {
    let targetCollection = '';
    if (beacons.length > 0) {
      targetCollection = beacons[0].split('/').length > 3 ? beacons[0].split('/')[3] : '';
    }
    return new ReferenceManager<T, U>(
      targetCollection,
      undefined,
      beacons.map((beacon) => {
        return beacon.split('/').pop() as string;
      })
    );
  }

  public isMultiTarget(): boolean {
    return this.targetCollection !== '';
  }
}

export class Reference {
  public static to<TProperties extends Properties, TReferences extends ReferencesType>(
    args: ReferenceToArgs
  ): ReferenceManager<TProperties, TReferences> {
    return new ReferenceManager<TProperties, TReferences>(
      '',
      undefined,
      Array.isArray(args.uuids) ? args.uuids : [args.uuids]
    );
  }
  public static toMultiTarget<TProperties extends Properties, TReferences extends ReferencesType>(
    args: ReferenceToMultiTargetArgs
  ): ReferenceManager<TProperties, TReferences> {
    return new ReferenceManager<TProperties, TReferences>(
      args.targetCollection,
      undefined,
      Array.isArray(args.uuids) ? args.uuids : [args.uuids]
    );
  }
}

export const referenceFromObjects = <TProperties extends Properties, TReferences extends ReferencesType>(
  objects: WeaviateObject<TProperties, TReferences>[]
): ReferenceManager<TProperties, TReferences> => {
  return new ReferenceManager<TProperties, TReferences>('', objects);
};

export type CrossReference<
  TProperties extends Properties,
  TReferences extends ReferencesType
> = ReferenceManager<TProperties, TReferences>;
