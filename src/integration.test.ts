import weaviate from './index.js';

describe('Integration testing of the client methods', () => {
  it('should connect using connectToLocal defaults', () => {
    return weaviate.connectToLocal();
  });

  it('should connect using connectToLocal with schema-ed host', () => {
    const logSpy = jest.spyOn(console, 'warn');
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
