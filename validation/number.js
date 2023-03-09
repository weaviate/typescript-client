export function isValidIntProperty(input) {
  return Number.isInteger(input);
}

export function isValidPositiveIntProperty(input) {
  return isValidIntProperty(input) && input >= 0;
}

export function isValidNumber(input) {
  return typeof input == "number";
}

export function isValidNumberArray(input) {
  if (Array.isArray(input)) {
    for (let i in input) {
      if (!isValidNumber(input[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}
