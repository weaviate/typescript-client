import { Application } from "@curveball/core";
import bodyParser from "@curveball/bodyparser";

const port = 40101
let serverCache = null;

export function testServer() {
  if (serverCache) {
    return serverCache;
  }

  let lastRequest = null;
  const app = new Application();

  app.use(bodyParser());
  app.use((ctx, next) => {
    lastRequest = ctx.request;
    return next();
  });
  app.use(
    getLocalOidcConfig,
    getRemoteOidcConfig,
    issueToken
  );
  const server = app.listen(port);

  serverCache = {
    server,
    app,
    lastRequest: () => lastRequest,
    port,
    url: "http://localhost:" + port,
    close: async () => {
      return new Promise(res => {
        server.close(() => res());
      });
    }
  };

  return serverCache;
}

const getLocalOidcConfig = (ctx, next) => {
  if (ctx.path !== "/v1/.well-known/openid-configuration") {
    return next();
  }

  ctx.response.type = "application/json";
  ctx.response.body = {
    clientId: "client123",
    href: "http://localhost:" + port + "/remote-openid-configuration"
  };
};

const getRemoteOidcConfig = (ctx, next) => {
  if (ctx.path !== "/remote-openid-configuration") {
    return next();
  }

  ctx.response.type = "application/json";
  ctx.response.body = {
    token_endpoint: "http://localhost:" + port + "/token",
    grant_types_supported: ["refresh_token", "password"]
  };
};

const issueToken = (ctx, next) => {
  if (ctx.path !== "/token") {
    return next();
  }

  ctx.response.type = "application/json";
  ctx.response.body = {
    access_token: "access_token_000",
    refresh_token: "refresh_token_000",
    expires_in: 3600,
  };
};
