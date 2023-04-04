import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
} from './auth';
import Connection from '.';

import weaviate from '..';

describe('connection', () => {
  it('makes a logged-in request when client host param has trailing slashes', () => {
    if (process.env.WCS_DUMMY_CI_PW == undefined || process.env.WCS_DUMMY_CI_PW == '') {
      console.warn('Skipping because `WCS_DUMMY_CI_PW` is not set');
      return;
    }

    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8085/////',
      authClientSecret: new AuthUserPasswordCredentials({
        username: 'ms_2d0e007e7136de11d5f29fce7a53dae219a51458@existiert.net',
        password: process.env.WCS_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes an Azure logged-in request with client credentials', () => {
    if (process.env.AZURE_CLIENT_SECRET == undefined || process.env.AZURE_CLIENT_SECRET == '') {
      console.warn('Skipping because `AZURE_CLIENT_SECRET` is not set');
      return;
    }

    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8081',
      authClientSecret: new AuthClientCredentials({
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        silentRefresh: false,
      }),
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes an Okta logged-in request with client credentials', () => {
    if (process.env.OKTA_CLIENT_SECRET == undefined || process.env.OKTA_CLIENT_SECRET == '') {
      console.warn('Skipping because `OKTA_CLIENT_SECRET` is not set');
      return;
    }

    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8082',
      authClientSecret: new AuthClientCredentials({
        clientSecret: process.env.OKTA_CLIENT_SECRET,
        scopes: ['some_scope'],
        silentRefresh: false,
      }),
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes an Okta logged-in request with username/password', () => {
    if (process.env.OKTA_DUMMY_CI_PW == undefined || process.env.OKTA_DUMMY_CI_PW == '') {
      console.warn('Skipping because `OKTA_DUMMY_CI_PW` is not set');
      return;
    }

    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8083',
      authClientSecret: new AuthUserPasswordCredentials({
        username: 'test@test.de',
        password: process.env.OKTA_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes a WCS logged-in request with username/password', () => {
    if (process.env.WCS_DUMMY_CI_PW == undefined || process.env.WCS_DUMMY_CI_PW == '') {
      console.warn('Skipping because `WCS_DUMMY_CI_PW` is not set');
      return;
    }

    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8085',
      authClientSecret: new AuthUserPasswordCredentials({
        username: 'ms_2d0e007e7136de11d5f29fce7a53dae219a51458@existiert.net',
        password: process.env.WCS_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('makes a logged-in request with API key', () => {
    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8085',
      apiKey: new ApiKey('my-secret-key'),
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
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
        username: 'ms_2d0e007e7136de11d5f29fce7a53dae219a51458@existiert.net',
        password: process.env.WCS_DUMMY_CI_PW,
        silentRefresh: false,
      }),
    });
    // obtain access token with user/pass so we can
    // use it to test AuthAccessTokenCredentials
    await dummy.login();

    const accessToken = (dummy as any).oidcAuth?.accessToken || '';
    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8085',
      authClientSecret: new AuthAccessTokenCredentials({
        accessToken: accessToken,
        expiresIn: 900,
      }),
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
        client.oidcAuth?.stopTokenRefresh();
      })
      .catch((e: any) => {
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
        username: 'ms_2d0e007e7136de11d5f29fce7a53dae219a51458@existiert.net',
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

  it('fails to access auth-enabled server without client auth', () => {
    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8085',
    });

    return client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        fail(`should not have succeeded. received: ${res}`);
      })
      .catch((e: Error) => {
        expect(e.message).toContain('401');
        expect(e.message).toContain('anonymous access not enabled');
      });
  });

  it('warns when client auth is configured, but server auth is not', async () => {
    const logSpy = jest.spyOn(console, 'warn');

    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
      authClientSecret: new AuthUserPasswordCredentials({
        username: 'some-user',
        password: 'passwd',
      }),
    });

    await client.misc
      .metaGetter()
      .do()
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
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
