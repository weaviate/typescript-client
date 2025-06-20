import { WeaviateDeserializationError } from '../errors.js';
import { WeaviateObject } from '../types/index.js';

const ITERATOR_CACHE_SIZE = 100;

export class Iterator<T> {
  private cache: WeaviateObject<T>[] = [];
  private last: string | undefined = undefined;
  constructor(private query: (limit: number, after?: string) => Promise<WeaviateObject<T>[]>) {
    this.query = query;
  }

  [Symbol.asyncIterator]() {
    return {
      next: async (): Promise<IteratorResult<WeaviateObject<T>>> => {
        const objects = await this.query(ITERATOR_CACHE_SIZE, this.last);
        this.cache = objects;
        if (this.cache.length == 0) {
          return {
            done: true,
            value: undefined,
          };
        }
        const obj = this.cache.shift();
        if (obj === undefined) {
          throw new WeaviateDeserializationError('Object iterator returned an object that is undefined');
        }
        this.last = obj?.uuid;
        if (this.last === undefined) {
          throw new WeaviateDeserializationError('Object iterator returned an object without a UUID');
        }
        return {
          done: false,
          value: obj,
        };
      },
    };
  }
}
