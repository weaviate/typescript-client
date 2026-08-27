import { ReferenceInput } from '../types/index.js';
import { ReferenceGuards, ReferenceManager } from './classes.js';
import { Beacon } from './types.js';

export function uuidToBeacon(uuid: string, targetCollection?: string): Beacon {
  return {
    beacon: `weaviate://localhost/${targetCollection ? `${targetCollection}/` : ''}${uuid}`,
  };
}

export const referenceFromObjects = <TProperties>(
  objects: any[],
  targetCollection: string,
  uuids: string[]
): ReferenceManager<TProperties> => {
  return new ReferenceManager<TProperties>(targetCollection, objects, uuids);
};

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
