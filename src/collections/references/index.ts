import { Properties, ReferenceInput, ReferenceToMultiTarget, WeaviateObject } from '../types';

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

  public isMultiTarget(): boolean {
    return this.targetCollection !== '';
  }
}

export class Reference {
  public static to<TProperties extends Properties = Properties>(
    uuids: string | string[]
  ): ReferenceManager<TProperties> {
    return new ReferenceManager<TProperties>('', undefined, Array.isArray(uuids) ? uuids : [uuids]);
  }
  public static toMultiTarget<TProperties extends Properties = Properties>(
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

export const referenceFromObjects = <TProperties>(
  objects: WeaviateObject<TProperties>[],
  targetCollection: string,
  uuids: string[]
): ReferenceManager<TProperties> => {
  return new ReferenceManager<TProperties>(targetCollection, objects, uuids);
};

export type CrossReference<TProperties extends Properties> = ReferenceManager<TProperties>;

export type CrossReferences<TProperties extends Properties[]> = ReferenceManager<UnionOf<TProperties>>;

type UnionOf<T> = T extends (infer U)[] ? U : never;

export class ReferenceGuards {
  public static isReferenceManager<T>(arg: ReferenceInput<T>): arg is ReferenceManager<T> {
    return arg instanceof ReferenceManager;
  }

  public static isUuid<T>(arg: ReferenceInput<T>): arg is string {
    return typeof arg === 'string';
  }

  public static isUuids<T>(arg: ReferenceInput<T>): arg is string[] {
    return Array.isArray(arg);
  }

  public static isMultiTarget<T>(arg: ReferenceInput<T>): arg is ReferenceToMultiTarget {
    return (arg as ReferenceToMultiTarget).targetCollection !== undefined;
  }
}

export const referenceToBeacons = <T>(ref: ReferenceInput<T>): Beacon[] => {
  if (ReferenceGuards.isReferenceManager(ref)) {
    return ref.toBeaconObjs();
  } else if (ReferenceGuards.isUuid(ref)) {
    return [uuidToBeacon(ref)];
  } else if (ReferenceGuards.isUuids(ref)) {
    return ref.map((uuid) => uuidToBeacon(uuid));
  } else if (ReferenceGuards.isMultiTarget(ref)) {
    return typeof ref.uuids === 'string'
      ? [uuidToBeacon(ref.uuids, ref.targetCollection)]
      : ref.uuids.map((uuid) => uuidToBeacon(uuid, ref.targetCollection));
  }
  return [];
};
