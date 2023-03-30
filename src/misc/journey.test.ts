import weaviate from '..';

describe('misc endpoints', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  const authClient = weaviate.client({
    scheme: 'http',
    host: 'localhost:8085',
  });

  it('reports as live', () => {
    return client.misc
      .liveChecker()
      .do()
      .then((res: any) => expect(res).toEqual(true))
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('reports as not live with a broken url', () => {
    const brokenClient = weaviate.client({
      scheme: 'http',
      host: 'localhost:12345', // note the incorrect port
    });

    return brokenClient.misc
      .liveChecker()
      .do()
      .then((res: any) => expect(res).toEqual(false))
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('reports as ready', () => {
    return client.misc
      .readyChecker()
      .do()
      .then((res: any) => expect(res).toEqual(true))
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('reports as not ready with a broken url', () => {
    const brokenClient = weaviate.client({
      scheme: 'http',
      host: 'localhost:12345', // note the incorrect port
    });

    return brokenClient.misc
      .readyChecker()
      .do()
      .then((res: any) => expect(res).toEqual(false))
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('displays meta info', () => {
    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
        expect(res.modules['text2vec-contextionary'].wordCount).toBeDefined();
        expect(res.modules['text2vec-contextionary'].wordCount).toBeGreaterThan(100);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('shows oidc config as undefined when not set', () => {
    return client.misc
      .openidConfigurationGetter()
      .do()
      .then((res: any) => {
        expect(res).toBeUndefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('shows oidc config when set', () => {
    return authClient.misc
      .openidConfigurationGetter()
      .do()
      .then((res: any) => {
        expect(res.clientId).toEqual('wcs');
        expect(res.href).toContain('.well-known/openid-configuration');
        expect(res.scopes).toEqual(['openid', 'email']);
      });
  });
});
