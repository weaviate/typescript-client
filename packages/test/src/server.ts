import bodyParser from '@curveball/bodyparser';
import { Application } from '@curveball/core';
import { IncomingMessage, Server, ServerResponse } from 'http';

export interface IServerCache {
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  app: Application;
  lastRequest: () => any;
  port: number;
  url: string;
  close: () => Promise<unknown>;
}

const port = 40101;
let serverCache: IServerCache | null = null;

export function testServer() {
  if (serverCache) {
    return serverCache;
  }

  let lastRequest: any = null;
  const app = new Application();

  app.use((bodyParser as any)());
  app.use((ctx, next) => {
    lastRequest = ctx.request;
    return next();
  });
  app.use(getLocalOidcConfig, getRemoteOidcConfig, issueToken, mockGetEndpoint, mockGraphQLResponse);
  const server = app.listen(port);

  serverCache = {
    server,
    app,
    lastRequest: () => lastRequest,
    port,
    url: 'http://localhost:' + port,
    close: () => {
      return new Promise((res: any) => {
        server.close(() => res());
      });
    },
  };

  return serverCache;
}

const mockGetEndpoint = (ctx: any, next: any) => {
  if (ctx.path !== '/v1/testEndpoint') {
    return next();
  }

  ctx.response.status = 200;
  ctx.response.body = { message: 'test endpoint' };
};

const mockGraphQLResponse = (ctx: any, next: any) => {
  if (ctx.path !== '/v1/graphql') {
    return next();
  }

  ctx.response.status = 200;
  ctx.response.body = {
    data: {
      someField: 'someValue',
    },
  };
};

const getLocalOidcConfig = (ctx: any, next: any) => {
  if (ctx.path !== '/v1/.well-known/openid-configuration') {
    return next();
  }

  ctx.response.type = 'application/json';
  ctx.response.body = {
    clientId: 'client123',
    href: 'http://localhost:' + port + '/remote-openid-configuration',
  };
};

const getRemoteOidcConfig = (ctx: any, next: any) => {
  if (ctx.path !== '/remote-openid-configuration') {
    return next();
  }

  ctx.response.type = 'application/json';
  ctx.response.body = {
    token_endpoint: 'http://localhost:' + port + '/token',
    grant_types_supported: ['refresh_token', 'password'],
  };
};

const issueToken = (ctx: any, next: any) => {
  if (ctx.path !== '/token') {
    return next();
  }

  ctx.response.type = 'application/json';
  ctx.response.body = {
    access_token: 'access_token_000',
    refresh_token: 'refresh_token_000',
    expires_in: 3600,
  };
};
