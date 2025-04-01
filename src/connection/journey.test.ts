import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
} from './auth.js';
import Connection from './index.js';

import { WeaviateStartUpError } from '../errors.js';
import weaviate from '../index.js';

describe('connection', () => {
  it('makes a logged-in request when client host param has trailing slashes', async () => {
    if (process.env.WCS_DUMMY_CI_PW == undefined || process.env.WCS_DUMMY_CI_PW == '') {
      console.warn('Skipping because `WCS_DUMMY_CI_PW` is not set');
      return Promise.resolve();
    }

    const client = await weaviate.connectToLocal({
      port: 8085,
      authCredentials: new AuthUserPasswordCredentials({
        username: 'oidc-test-user@weaviate.io',
        password: process.env.WCS_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });

    return client
      .getMeta()
      .then((res) => {
        expect(res.version).toBeDefined();
      })
      .catch((e) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  // it('makes an Azure logged-in request with client credentials', async () => {
  //   if (process.env.AZURE_CLIENT_SECRET == undefined || process.env.AZURE_CLIENT_SECRET == '') {
  //     console.warn('Skipping because `AZURE_CLIENT_SECRET` is not set');
  //     return Promise.resolve();
  //   }

  //   const client = await weaviate.connectToLocal({
  //     port: 8081,
  //     authCredentials: new AuthClientCredentials({
  //       clientSecret: process.env.AZURE_CLIENT_SECRET,
  //       silentRefresh: false,
  //     }),
  //   });

  //   return client
  //     .getMeta()
  //     .then((res) => {
  //       expect(res.version).toBeDefined();
  //     })
  //     .catch((e) => {
  //       throw new Error('it should not have errord: ' + e);
  //     });
  // });

  it('makes an Okta logged-in request with client credentials', async () => {
    if (process.env.OKTA_CLIENT_SECRET == undefined || process.env.OKTA_CLIENT_SECRET == '') {
      console.warn('Skipping because `OKTA_CLIENT_SECRET` is not set');
      return Promise.resolve();
    }

    const client = await weaviate.connectToLocal({
      port: 8082,
      authCredentials: new AuthClientCredentials({
        clientSecret: process.env.OKTA_CLIENT_SECRET,
        scopes: ['some_scope'],
        silentRefresh: false,
      }),
    });

    return client
      .getMeta()
      .then((res) => {
        expect(res.version).toBeDefined();
      })
      .catch((e) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes an Okta logged-in request with username/password', async () => {
    if (process.env.OKTA_DUMMY_CI_PW == undefined || process.env.OKTA_DUMMY_CI_PW == '') {
      console.warn('Skipping because `OKTA_DUMMY_CI_PW` is not set');
      return Promise.resolve();
    }

    const client = await weaviate.connectToLocal({
      port: 8083,
      authCredentials: new AuthUserPasswordCredentials({
        username: 'test@test.de',
        password: process.env.OKTA_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });

    return client
      .getMeta()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes a WCS logged-in request with username/password', async () => {
    if (process.env.WCS_DUMMY_CI_PW == undefined || process.env.WCS_DUMMY_CI_PW == '') {
      console.warn('Skipping because `WCS_DUMMY_CI_PW` is not set');
      return Promise.resolve();
    }

    const client = await weaviate.connectToLocal({
      port: 8085,
      authCredentials: new AuthUserPasswordCredentials({
        username: 'oidc-test-user@weaviate.io',
        password: process.env.WCS_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });

    return client
      .getMeta()
      .then((res) => {
        expect(res.version).toBeDefined();
      })
      .catch((e) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes a logged-in request with API key', async () => {
    const client = await weaviate.connectToLocal({
      port: 8085,
      authCredentials: new ApiKey('my-secret-key'),
    });

    return client
      .getMeta()
      .then((res) => {
        expect(res.version).toBeDefined();
      })
      .catch((e) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes a logged-in request with API key as string', async () => {
    const client = await weaviate.connectToLocal({
      port: 8085,
      authCredentials: 'my-secret-key',
    });

    return client
      .getMeta()
      .then((res) => {
        expect(res.version).toBeDefined();
      })
      .catch((e) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes a logged-in request with access token', async () => {
    if (process.env.WCS_DUMMY_CI_PW == undefined || process.env.WCS_DUMMY_CI_PW == '') {
      console.warn('Skipping because `WCS_DUMMY_CI_PW` is not set');
      return;
    }

    const dummy = new Connection({
      scheme: 'http',
      host: 'localhost:8085',
      authClientSecret: new AuthUserPasswordCredentials({
        username: 'oidc-test-user@weaviate.io',
        password: process.env.WCS_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });
    // obtain access token with user/pass so we can
    // use it to test AuthAccessTokenCredentials
    await dummy.login();

    const accessToken = (dummy as any).oidcAuth?.accessToken || '';
    const client = await weaviate.connectToLocal({
      port: 8085,
      authCredentials: new AuthAccessTokenCredentials({
        accessToken: accessToken,
        expiresIn: 900,
      }),
    });

    return client
      .getMeta()
      .then((res) => {
        expect(res.version).toBeDefined();
        client.oidcAuth?.stopTokenRefresh();
      })
      .catch((e) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('uses refresh token to fetch new access token', async () => {
    if (process.env.WCS_DUMMY_CI_PW == undefined || process.env.WCS_DUMMY_CI_PW == '') {
      console.warn('Skipping because `WCS_DUMMY_CI_PW` is not set');
      return;
    }

    const dummy = new Connection({
      scheme: 'http',
      host: 'localhost:8085',
      authClientSecret: new AuthUserPasswordCredentials({
        username: 'oidc-test-user@weaviate.io',
        password: process.env.WCS_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });
    // obtain access token with user/pass so we can
    // use it to test AuthAccessTokenCredentials
    await dummy.login();

    const accessToken = (dummy as any).oidcAuth?.accessToken || '';
    const conn = new Connection({
      scheme: 'http',
      host: 'localhost:8085',
      authClientSecret: new AuthAccessTokenCredentials({
        accessToken: accessToken,
        expiresIn: 1,
        refreshToken: (dummy as any).oidcAuth?.refreshToken,
      }),
    });
    // force the use of refreshToken
    (conn as any).oidcAuth?.resetExpiresAt();

    return conn
      .login()
      .then((resp) => {
        expect(resp).toBeDefined();
        expect(resp != '').toBeTruthy();
        conn.oidcAuth?.stopTokenRefresh();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('fails to access auth-enabled server without client auth', async () => {
    expect.assertions(3);
    try {
      await weaviate.connectToLocal({
        port: 8085,
      });
      throw new Error('Promise should have been rejected');
    } catch (error: any) {
      expect(error).toBeInstanceOf(WeaviateStartUpError);
      expect(error.message).toContain('401');
      expect(error.message).toContain('anonymous access not enabled');
    }
  });

  it('warns when client auth is configured, but server auth is not', async () => {
    const logSpy = jest.spyOn(console, 'warn');

    const client = await weaviate.connectToLocal({
      authCredentials: new AuthUserPasswordCredentials({
        username: 'some-user',
        password: 'passwd',
      }),
    });

    await client
      .getMeta()
      .then((res) => {
        expect(res.version).toBeDefined();
      })
      .catch((e) => {
        throw new Error('it should not have errord: ' + e);
      });

    expect(logSpy).toHaveBeenCalledWith('client is configured for authentication, but server is not');
  });

  it('warns when client access token expires, no refresh token provided', async () => {
    const logSpy = jest.spyOn(console, 'warn');

    const conn = new Connection({
      scheme: 'http',
      host: 'localhost:8085',
      authClientSecret: new AuthAccessTokenCredentials({
        accessToken: 'abcd1234',
        expiresIn: 1,
      }),
    });
    // force the use of refreshToken
    (conn as any).oidcAuth?.resetExpiresAt();

    await conn
      .login()
      .then((resp) => {
        expect(resp).toBeDefined();
        expect(resp).toEqual('abcd1234');
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });

    expect(logSpy).toHaveBeenCalledWith(
      'AuthAccessTokenCredentials not provided with refreshToken, cannot refresh'
    );
  });

  it('fails to create client with both OIDC creds and API key set', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Connection({
        scheme: 'http',
        host: 'localhost:8085',
        authClientSecret: new AuthAccessTokenCredentials({
          accessToken: 'abcd1234',
          expiresIn: 1,
        }),
        apiKey: new ApiKey('some-key'),
      });
    }).toThrow('must provide one of authClientSecret (OIDC) or apiKey, cannot provide both');
  });
});
