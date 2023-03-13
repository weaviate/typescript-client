import { IHttpClient } from './httpClient';

interface IAuthenticatorResult {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
}

interface IAuthenticator {
  refresh: () => Promise<IAuthenticatorResult>;
}

export class Authenticator {
  private readonly http: IHttpClient;
  private readonly creds: any;
  private accessToken: string;
  private refreshToken?: string;
  private expiresAt: number;
  private refreshRunning: boolean;

  constructor(http: IHttpClient, creds: any) {
    this.http = http;
    this.creds = creds;
    this.accessToken = '';
    this.refreshToken = '';
    this.expiresAt = 0;
    this.refreshRunning = false;

    // If the authentication method is access token,
    // our bearer token is already available for use
    if (this.creds instanceof AuthAccessTokenCredentials) {
      this.accessToken = this.creds.accessToken;
      this.expiresAt = this.creds.expiresAt;
      this.refreshToken = this.creds.refreshToken;
    }
  }

  refresh = async (localConfig: any) => {
    const config = await this.getOpenidConfig(localConfig);

    let authenticator: IAuthenticator;
    switch (this.creds.constructor) {
      case AuthUserPasswordCredentials:
        authenticator = new UserPasswordAuthenticator(
          this.http,
          this.creds,
          config
        );
        break;
      case AuthAccessTokenCredentials:
        authenticator = new AccessTokenAuthenticator(
          this.http,
          this.creds,
          config
        );
        break;
      case AuthClientCredentials:
        authenticator = new ClientCredentialsAuthenticator(
          this.http,
          this.creds,
          config
        );
        break;
      default:
        throw new Error('unsupported credential type');
    }

    return authenticator.refresh().then((resp) => {
      this.accessToken = resp.accessToken;
      this.expiresAt = resp.expiresAt;
      this.refreshToken = resp.refreshToken;
      if (!this.refreshRunning && this.refreshTokenProvided()) {
        this.runBackgroundTokenRefresh(authenticator);
        this.refreshRunning = true;
      }
    });
  };

  getOpenidConfig = (localConfig: any) => {
    return this.http
      .externalGet(localConfig.href)
      .then((openidProviderConfig: any) => {
        const scopes = localConfig.scopes || [];
        return {
          clientId: localConfig.clientId,
          provider: openidProviderConfig,
          scopes: scopes,
        };
      });
  };

  runBackgroundTokenRefresh = (authenticator: { refresh: () => any }) => {
    setInterval(async () => {
      // check every 30s if the token will expire in <= 1m,
      // if so, refresh
      if (this.expiresAt - Date.now() <= 60_000) {
        const resp = await authenticator.refresh();
        this.accessToken = resp.accessToken;
        this.expiresAt = resp.expiresAt;
        this.refreshToken = resp.refreshToken;
      }
    }, 30_000);
  };

  refreshTokenProvided = () => {
    return this.refreshToken && this.refreshToken != '';
  };
}

export interface IAuthUserPasswordCredentials {
  username: string;
  password?: string;
  scopes?: any[];
}

export class AuthUserPasswordCredentials {
  private username: string;
  private password?: string;
  private scopes?: any[];
  constructor(creds: IAuthUserPasswordCredentials) {
    this.username = creds.username;
    this.password = creds.password;
    this.scopes = creds.scopes;
  }
}

interface IRequestAccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

class UserPasswordAuthenticator implements IAuthenticator {
  private creds: any;
  private http: any;
  private openidConfig: any;
  constructor(http: any, creds: any, config: any) {
    this.http = http;
    this.creds = creds;
    this.openidConfig = config;
    if (creds.scopes) {
      this.openidConfig.scopes.push(creds.scopes);
    }
  }

  refresh = () => {
    this.validateOpenidConfig();
    return this.requestAccessToken()
      .then((tokenResp: IRequestAccessTokenResponse) => {
        return {
          accessToken: tokenResp.access_token,
          expiresAt: calcExpirationEpoch(tokenResp.expires_in),
          refreshToken: tokenResp.refresh_token,
        };
      })
      .catch((err: any) => {
        return Promise.reject(
          new Error(`failed to refresh access token: ${err}`)
        );
      });
  };

  validateOpenidConfig = () => {
    if (
      this.openidConfig.provider.grant_types_supported !== undefined &&
      !this.openidConfig.provider.grant_types_supported.includes('password')
    ) {
      throw new Error('grant_type password not supported');
    }
    if (
      this.openidConfig.provider.token_endpoint.includes(
        'https://login.microsoftonline.com'
      )
    ) {
      throw new Error(
        'microsoft/azure recommends to avoid authentication using ' +
          'username and password, so this method is not supported by this client'
      );
    }
    this.openidConfig.scopes.push('offline_access');
  };

  requestAccessToken = () => {
    const url = this.openidConfig.provider.token_endpoint;
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: this.openidConfig.clientId,
      username: this.creds.username,
      password: this.creds.password,
      scope: this.openidConfig.scopes.join(' '),
    });
    const contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
    return this.http.externalPost(url, params, contentType);
  };
}

export interface IAuthAccessTokenCredentials {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export class AuthAccessTokenCredentials {
  public readonly accessToken: string;
  public readonly expiresAt: number;
  public readonly refreshToken?: string;

  constructor(creds: IAuthAccessTokenCredentials) {
    this.validate(creds);
    this.accessToken = creds.accessToken;
    this.expiresAt = calcExpirationEpoch(creds.expiresIn);
    this.refreshToken = creds.refreshToken;
  }

  validate = (creds: IAuthAccessTokenCredentials) => {
    if (creds.expiresIn === undefined) {
      throw new Error('AuthAccessTokenCredentials: expiresIn is required');
    }
    if (!Number.isInteger(creds.expiresIn) || creds.expiresIn <= 0) {
      throw new Error('AuthAccessTokenCredentials: expiresIn must be int > 0');
    }
  };
}

class AccessTokenAuthenticator implements IAuthenticator {
  private creds: any;
  private http: any;
  private openidConfig: any;
  constructor(http: any, creds: any, config: any) {
    this.http = http;
    this.creds = creds;
    this.openidConfig = config;
  }

  refresh = () => {
    if (
      this.creds.refreshToken === undefined ||
      this.creds.refreshToken == ''
    ) {
      console.warn(
        'AuthAccessTokenCredentials not provided with refreshToken, cannot refresh'
      );
      return Promise.resolve({
        accessToken: this.creds.accessToken,
        expiresAt: this.creds.expiresAt,
      });
    }
    this.validateOpenidConfig();
    return this.requestAccessToken()
      .then((tokenResp: IRequestAccessTokenResponse) => {
        return {
          accessToken: tokenResp.access_token,
          expiresAt: calcExpirationEpoch(tokenResp.expires_in),
          refreshToken: tokenResp.refresh_token,
        };
      })
      .catch((err: any) => {
        return Promise.reject(
          new Error(`failed to refresh access token: ${err}`)
        );
      });
  };

  validateOpenidConfig = () => {
    if (
      this.openidConfig.provider.grant_types_supported === undefined ||
      !this.openidConfig.provider.grant_types_supported.includes(
        'refresh_token'
      )
    ) {
      throw new Error('grant_type refresh_token not supported');
    }
  };

  requestAccessToken = () => {
    const url = this.openidConfig.provider.token_endpoint;
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.openidConfig.clientId,
      refresh_token: this.creds.refreshToken,
    });
    const contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
    return this.http.externalPost(url, params, contentType);
  };
}

export interface IAuthClientCredentials {
  clientSecret: string;
  scopes?: any[];
}

export class AuthClientCredentials {
  private clientSecret: any;
  private scopes?: any[];

  constructor(creds: IAuthClientCredentials) {
    this.clientSecret = creds.clientSecret;
    this.scopes = creds.scopes;
  }
}

class ClientCredentialsAuthenticator implements IAuthenticator {
  private creds: any;
  private http: any;
  private openidConfig: any;

  constructor(http: any, creds: any, config: any) {
    this.http = http;
    this.creds = creds;
    this.openidConfig = config;
    if (creds.scopes) {
      this.openidConfig.scopes.push(creds.scopes);
    }
  }

  refresh = () => {
    this.validateOpenidConfig();
    return this.requestAccessToken()
      .then((tokenResp: IRequestAccessTokenResponse) => {
        return {
          accessToken: tokenResp.access_token,
          expiresAt: calcExpirationEpoch(tokenResp.expires_in),
          refreshToken: tokenResp.refresh_token,
        };
      })
      .catch((err: any) => {
        return Promise.reject(
          new Error(`failed to refresh access token: ${err}`)
        );
      });
  };

  validateOpenidConfig = () => {
    if (this.openidConfig.scopes.length > 0) {
      return;
    }
    if (
      this.openidConfig.provider.token_endpoint.includes(
        'https://login.microsoftonline.com'
      )
    ) {
      this.openidConfig.scopes.push(this.openidConfig.clientId + '/.default');
    }
  };

  requestAccessToken = () => {
    const url = this.openidConfig.provider.token_endpoint;
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.openidConfig.clientId,
      client_secret: this.creds.clientSecret,
      scope: this.openidConfig.scopes.join(' '),
    });

    const contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
    return this.http.externalPost(url, params, contentType);
  };
}

function calcExpirationEpoch(expiresIn: number): number {
  return Date.now() + (expiresIn - 2) * 1000; // -2 for some lag
}
