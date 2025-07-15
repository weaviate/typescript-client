import {
  Properties,
  ReferenceInput,
  ReferenceToMultiTarget,
  Vectors,
  WeaviateObject,
} from '../types/index.js';
import { Beacon } from './types.js';
import { uuidToBeacon } from './utils.js';

export class ReferenceManager<T> {
  public objects: WeaviateObject<T, Vectors>[];
  public targetCollection: string;
  public uuids?: string[];

  constructor(targetCollection: string, objects?: WeaviateObject<T, Vectors>[], uuids?: string[]) {
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

/**
 * A factory class to create references from objects to other objects.
 */
export class Reference {
  /**
   * Create a single-target reference with given UUID(s).
   *
   * @param {string | string[]} uuids The UUID(s) of the target object(s).
   * @returns {ReferenceManager} The reference manager object.
   */
  public static to<TProperties extends Properties = Properties>(
    uuids: string | string[]
  ): ReferenceManager<TProperties> {
    return new ReferenceManager<TProperties>('', undefined, Array.isArray(uuids) ? uuids : [uuids]);
  }
  /**
   * Create a multi-target reference with given UUID(s) pointing to a specific target collection.
   *
   * @param {string | string[]} uuids The UUID(s) of the target object(s).
   * @param {string} targetCollection The target collection name.
   * @returns {ReferenceManager} The reference manager object.
   */
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
