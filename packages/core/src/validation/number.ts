export function isValidIntProperty(input: any) {
  return Number.isInteger(input);
}

export function isValidPositiveIntProperty(input: any) {
  return isValidIntProperty(input) && input >= 0;
}

export function isValidNumber(input: any) {
  return typeof input == 'number';
}

export function isValidNumberArray(input: any) {
  if (Array.isArray(input)) {
    for (const i in input) {
      if (!isValidNumber(input[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}
