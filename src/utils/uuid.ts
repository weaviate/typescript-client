import { v5 as uuid5 } from 'uuid';

// Generates UUIDv5, used to consistently generate the same UUID for
// a specific identifier and namespace
export function generateUuid5(identifier: any, namespace: any = ''): string {
  const stringified = JSON.stringify(identifier) + JSON.stringify(namespace);
  return uuid5(stringified, uuid5.DNS).toString();
}
