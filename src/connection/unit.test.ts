import { testServer } from '../../test/server';
import {
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  ApiKey,
} from './auth';
import Connection from '.';

describe('mock server auth tests', () => {
  const server = testServer();
  describe('OIDC auth flows', () => {
    it('should login with client_credentials grant', async () => {
      const conn = new Connection({
        scheme: 'http',
        host: 'localhost:' + server.port,
        authClientSecret: new AuthClientCredentials({
          clientSecret: 'supersecret',
          scopes: ['some_scope'],
          silentRefresh: false,
        }),
      });

      await conn
        .login()
        .then((token) => {
          expect(token).toEqual('access_token_000');
          expect((conn as any).oidcAuth?.refreshToken).toEqual('refresh_token_000');
          expect((conn as any).oidcAuth?.expiresAt).toBeGreaterThan(Date.now());
        })
        .catch((e) => {
          throw new Error('it should not have failed: ' + e);
        });

      const request = server.lastRequest();

      expect(request.body).toEqual({
        client_id: 'client123',
        client_secret: 'supersecret',
        grant_type: 'client_credentials',
        scope: 'some_scope',
      });
    });

    it('should login with password grant', async () => {
      const conn = new Connection({
        scheme: 'http',
        host: 'localhost:' + server.port,
        authClientSecret: new AuthUserPasswordCredentials({
          username: 'user123',
          password: 'secure_password',
          scopes: ['custom_scope'],
        }),
      });

      await conn
        .login()
        .then((token) => {
          expect(token).toEqual('access_token_000');
          expect((conn as any).oidcAuth?.refreshToken).toEqual('refresh_token_000');
          expect((conn as any).oidcAuth?.expiresAt).toBeGreaterThan(Date.now());
          conn.oidcAuth?.stopTokenRefresh();
        })
        .catch((e) => {
          throw new Error('it should not have failed: ' + e);
        });

      const request = server.lastRequest();

      expect(request.body).toEqual({
        username: 'user123',
        password: 'secure_password',
        grant_type: 'password',
        client_id: 'client123',
        scope: 'custom_scope offline_access',
      });
    });

    it('should login with refresh_token grant', async () => {
      const conn = new Connection({
        scheme: 'http',
        host: 'localhost:' + server.port,
        authClientSecret: new AuthAccessTokenCredentials({
          accessToken: 'old-access-token',
          expiresIn: 1,
          refreshToken: 'old-refresh-token',
        }),
      });

      // force the use of refreshToken
      (conn as any).oidcAuth?.resetExpiresAt();

      await conn
        .login()
        .then((token) => {
          expect(token).toEqual('access_token_000');
          expect((conn as any).oidcAuth?.refreshToken).toEqual('refresh_token_000');
          expect((conn as any).oidcAuth?.expiresAt).toBeGreaterThan(Date.now());
          conn.oidcAuth?.stopTokenRefresh();
        })
        .catch((e) => {
          throw new Error('it should not have failed: ' + e);
        });

      const request = server.lastRequest();

      expect(request.body).toEqual({
        client_id: 'client123',
        grant_type: 'refresh_token',
        refresh_token: 'old-refresh-token',
      });
    });
  });

  it('should login with API key', async () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      scheme: 'http',
      host: 'localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });

    await conn.login().then((key) => expect(key).toEqual(apiKey));
  });

  it('should construct the correct url when host contains scheme', () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      scheme: 'http',
      host: 'http://localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });
    const expectedPath = 'http://localhost:' + server.port;

    expect(conn.host).toEqual(expectedPath);
  });

  it('should construct the correct url when scheme specified and host does not contain scheme', () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      scheme: 'http',
      host: 'localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });
    const expectedPath = 'http://localhost:' + server.port;

    expect(conn.host).toEqual(expectedPath);
  });

  it('should construct the correct url when no scheme is specified but host contains scheme', () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      host: 'http://localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });
    const expectedPath = 'http://localhost:' + server.port;

    expect(conn.host).toEqual(expectedPath);
  });

  it('should throw error when host contains different scheme than specified', () => {
    const apiKey = 'abcd123';

    const createConnection = () => {
      return new Connection({
        scheme: 'https',
        host: 'http://localhost:' + server.port,
        apiKey: new ApiKey(apiKey),
      });
    };

    expect(createConnection).toThrow(
      'The host contains a different protocol than specified in the scheme (scheme: https:// != host: http://)'
    );
  });

  it('should throw error when scheme not specified and included in host', () => {
    const apiKey = 'abcd123';

    const createConnection = () => {
      return new Connection({
        host: 'localhost:' + server.port,
        apiKey: new ApiKey(apiKey),
      });
    };

    expect(createConnection).toThrow(
      'The host must start with a recognized protocol (e.g., http:// or https://) if no scheme is provided.'
    );
  });

  it('shuts down the server', () => {
    return server.close();
  });
});
