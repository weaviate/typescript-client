import { Properties, WeaviateObject } from '../types';

interface ReferenceToArgs {
  uuids: string | string[];
}

interface ReferenceToMultiTargetArgs extends ReferenceToArgs {
  targetCollection: string;
}

export type Beacon = {
  beacon: string;
};

export function uuidToBeacon(uuid: string, targetCollection?: string): Beacon {
  return {
    beacon: `weaviate://localhost/${targetCollection ? `${targetCollection}/` : ''}${uuid}`,
  };
}

export class ReferenceManager<T> {
  public objects: WeaviateObject<T>[];
  public targetCollection: string;
  public uuids?: string[];

  constructor(targetCollection: string, objects?: WeaviateObject<T>[], uuids?: string[]) {
    this.objects = objects ?? [];
    this.targetCollection = targetCollection;
    this.uuids = uuids;
  }

  public toBeaconObjs(): Beacon[] {
    return this.uuids ? this.uuids.map((uuid) => uuidToBeacon(uuid, this.targetCollection)) : [];
  }

  public toBeaconStrings(): string[] {
    return this.uuids ? this.uuids.map((uuid) => uuidToBeacon(uuid, this.targetCollection).beacon) : [];
  }

  static fromBeaconStrings<T extends Properties>(beacons: string[]): ReferenceManager<T> {
    let targetCollection = '';
    if (beacons.length > 0) {
      targetCollection = beacons[0].split('/').length > 3 ? beacons[0].split('/')[3] : '';
    }
    return new ReferenceManager<T>(
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
  public static to<TProperties extends Properties>(uuids: string | string[]): ReferenceManager<TProperties> {
    return new ReferenceManager<TProperties>('', undefined, Array.isArray(uuids) ? uuids : [uuids]);
  }
  public static toMultiTarget<TProperties extends Properties>(
    uuids: string | string[],
    targetCollection: string
  ): ReferenceManager<TProperties> {
    return new ReferenceManager<TProperties>(
      targetCollection,
      undefined,
      Array.isArray(uuids) ? uuids : [uuids]
    );
  }
}

export const referenceFromObjects = <TProperties extends Properties>(
  objects: WeaviateObject<TProperties>[]
): ReferenceManager<TProperties> => {
  return new ReferenceManager<TProperties>('', objects);
};

export type CrossReference<TProperties extends Properties> = ReferenceManager<TProperties>;
