import weaviate from '@weaviate/node';
import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

describe('Integration testing of the client methods', () => {
  it('should connect using connectToLocal defaults', () => {
    return weaviate.connectToLocal();
  });

  it('should connect using connectToLocal with schema-ed host', () => {
    const logSpy = vitest.spyOn(console, 'warn');
    return weaviate
      .connectToLocal({
        host: 'http://localhost',
      })
      .then(() => expect(logSpy).toHaveBeenCalledTimes(2));
  });

  it('should connect using connectToLocal with non-schema-ed host', () => {
    return weaviate.connectToLocal({
      host: 'localhost',
    });
  });
});
