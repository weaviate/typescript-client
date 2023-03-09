import { testServer } from "../test/server";
import {
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials
} from "./auth";
import Connection from "./index";

describe("mock server auth tests", () => {
  const server = testServer();

  it("should login with client_credentials grant", async () => {
    const conn = new Connection({
      scheme: "http",
      host: "localhost:" + server.port,
      authClientSecret: new AuthClientCredentials({
        clientSecret: "supersecret",
        scopes: ["some_scope"]
      })
    });

    await conn.login()
      .then(token => {
        expect(token).toEqual("access_token_000");
        expect(conn.auth.refreshToken).toEqual("refresh_token_000");
        expect(conn.auth.expiresAt).toBeGreaterThan(Date.now());
      })
      .catch(e => fail("it should not have failed: " + e))

    const request = server.lastRequest();

    expect(request.body).toEqual({
      client_id: "client123",
      client_secret: "supersecret",
      grant_type: "client_credentials",
      scope: "some_scope"
    });
  })

  it("should login with password grant", async () => {
    const conn = new Connection({
      scheme: "http",
      host: "localhost:" + server.port,
      authClientSecret: new AuthUserPasswordCredentials({
        username: "user123",
        password: "secure_password",
        scopes: ["custom_scope"]
      })
    });

    await conn.login()
      .then(token => {
        expect(token).toEqual("access_token_000");
        expect(conn.auth.refreshToken).toEqual("refresh_token_000");
        expect(conn.auth.expiresAt).toBeGreaterThan(Date.now());
      })
      .catch(e => fail("it should not have failed: " + e))

    const request = server.lastRequest();

    expect(request.body).toEqual({
      username: "user123",
      password: "secure_password",
      grant_type: "password",
      client_id: "client123",
      scope: "custom_scope offline_access"
    });
  })

  it("should login with refresh_token grant", async () => {
    const conn = new Connection({
      scheme: "http",
      host: "localhost:" + server.port,
      authClientSecret: new AuthAccessTokenCredentials({
        accessToken: "old-access-token",
        expiresIn: 1,
        refreshToken: "old-refresh-token"
      })
    });

    // force the use of refreshToken
    conn.auth.expiresAt = 0

    await conn.login()
      .then(token => {
        expect(token).toEqual("access_token_000");
        expect(conn.auth.refreshToken).toEqual("refresh_token_000");
        expect(conn.auth.expiresAt).toBeGreaterThan(Date.now());
      })
      .catch(e => fail("it should not have failed: " + e))

    const request = server.lastRequest();

    expect(request.body).toEqual({
      client_id: "client123",
      grant_type: "refresh_token",
      refresh_token: "old-refresh-token"
    });
  })

  it("shuts down the server", async () => {
    return server.close();
  })
})
