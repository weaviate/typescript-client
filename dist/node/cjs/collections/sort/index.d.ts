export type { Sort } from './types.js';
export { Sorting };
import { Sorting } from './classes.js';
import { Sort } from './types.js';
declare const sort: <T>() => Sort<T>;
export default sort;
