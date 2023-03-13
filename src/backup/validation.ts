import { isValidStringProperty } from '../validation/string';

export function validateIncludeClassNames(classNames?: string[]) {
  if (Array.isArray(classNames)) {
    const errors: any[] = [];
    classNames.forEach((className) => {
      if (!isValidStringProperty(className)) {
        errors.push(
          'string className invalid - set with .withIncludeClassNames(...classNames)'
        );
      }
    });
    return errors;
  }
  if (classNames !== null && classNames !== undefined) {
    return [
      'strings classNames invalid - set with .withIncludeClassNames(...classNames)',
    ];
  }
  return [];
}

export function validateExcludeClassNames(classNames?: string[]) {
  if (Array.isArray(classNames)) {
    const errors: any[] = [];
    classNames.forEach((className) => {
      if (!isValidStringProperty(className)) {
        errors.push(
          'string className invalid - set with .withExcludeClassNames(...classNames)'
        );
      }
    });
    return errors;
  }
  if (classNames !== null && classNames !== undefined) {
    return [
      'strings classNames invalid - set with .withExcludeClassNames(...classNames)',
    ];
  }
  return [];
}

export function validateBackend(backend?: string) {
  if (!isValidStringProperty(backend)) {
    return ['string backend must set - set with .withBackend(backend)'];
  }
  return [];
}

export function validateBackupId(backupId?: string) {
  if (!isValidStringProperty(backupId)) {
    return ['string backupId must be set - set with .withBackupId(backupId)'];
  }
  return [];
}
