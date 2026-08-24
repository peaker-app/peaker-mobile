import { afterEach, describe, expect, it, vi } from "vitest";
import {
  emptyResponse,
  gatewayOrigin,
  headerOf,
  jsonResponse,
  loadAuth,
  requestOf,
  tokens,
} from "@/test/authHarness";

const credentials = { identifier: "ana@peaker.app", password: "secret" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("signIn", () => {
  it("signIn_validCredentials_storesTheSession", async () => {
    const { session, sessionStore, tokenStore } = await loadAuth();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(tokens()));

    await session.signIn(credentials);

    expect(sessionStore.getSessionState()).toEqual({
      status: "authenticated",
      session: { userId: "u-1", email: "ana@peaker.app" },
    });
    await expect(tokenStore.readRefreshToken()).resolves.toBe("refresh-1");
  });

  it("signIn_postsToTheLoginEndpoint", async () => {
    const { session } = await loadAuth();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(tokens()));

    await session.signIn(credentials);

    const { url, init } = requestOf(fetchSpy.mock.calls[0] as unknown[]);
    expect(url).toBe(`${gatewayOrigin}/api/auth/login`);
    expect(init.body).toBe(JSON.stringify(credentials));
    expect(headerOf(init, "X-Correlation-Id")).toBeDefined();
  });

  it("signIn_rejectedCredentials_throwsApiErrorAndStoresNothing", async () => {
    const { session, tokenStore } = await loadAuth();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ title: "User.InvalidCredentials" }, 401),
    );

    await expect(session.signIn(credentials)).rejects.toMatchObject({
      problem: { status: 401, title: "User.InvalidCredentials" },
    });
    expect(tokenStore.getAccessToken()).toBeUndefined();
  });

  it("signIn_failure_doesNotTriggerARefresh", async () => {
    const { session } = await loadAuth();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(emptyResponse(401));

    await expect(session.signIn(credentials)).rejects.toThrow();

    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});

describe("signOut", () => {
  it("signOut_activeSession_revokesTheRefreshTokenAtTheGateway", async () => {
    const { session, tokenStore } = await loadAuth();
    const pair = tokens();
    await tokenStore.persistTokens(pair);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(emptyResponse(204));

    await session.signOut();

    const { url, init } = requestOf(fetchSpy.mock.calls[0] as unknown[]);
    expect(url).toBe(`${gatewayOrigin}/api/auth/logout`);
    expect(headerOf(init, "Authorization")).toBe(`Bearer ${pair.accessToken}`);
    expect(init.body).toBe(JSON.stringify({ refreshToken: pair.refreshToken }));
  });

  it("signOut_always_clearsTheLocalSession", async () => {
    const { session, sessionStore, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    vi.spyOn(globalThis, "fetch").mockResolvedValue(emptyResponse(204));

    await session.signOut();

    expect(tokenStore.getAccessToken()).toBeUndefined();
    await expect(tokenStore.readRefreshToken()).resolves.toBeUndefined();
    expect(sessionStore.getSessionState().status).toBe("anonymous");
  });

  it("signOut_networkFailure_stillClearsTheLocalSession", async () => {
    const { session, sessionStore, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(session.signOut()).resolves.toBeUndefined();

    expect(sessionStore.getSessionState().status).toBe("anonymous");
  });

  it("signOut_withoutASession_doesNotCallTheGateway", async () => {
    const { session } = await loadAuth();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await session.signOut();

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("restoreSession", () => {
  it("restoreSession_withoutAStoredToken_settlesAnonymous", async () => {
    const { session } = await loadAuth();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(session.restoreSession()).resolves.toEqual({
      status: "anonymous",
      session: undefined,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("restoreSession_withAValidRefreshToken_rebuildsTheSession", async () => {
    const { session, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens({ refreshToken: "stored" }));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(tokens()));

    await expect(session.restoreSession()).resolves.toEqual({
      status: "authenticated",
      session: { userId: "u-1", email: "ana@peaker.app" },
    });
  });

  it("restoreSession_withARejectedRefreshToken_settlesAnonymous", async () => {
    const { session, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    vi.spyOn(globalThis, "fetch").mockResolvedValue(emptyResponse(401));

    expect((await session.restoreSession()).status).toBe("anonymous");
  });

  it("restoreSession_startingWithoutNetwork_settlesInsteadOfHangingTheGate", async () => {
    const { session, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    expect((await session.restoreSession()).status).toBe("anonymous");
  });

  it("restoreSession_startingWithoutNetwork_doesNotThrowAwayTheStoredSession", async () => {
    const { session, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens({ refreshToken: "stored" }));
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await session.restoreSession();

    await expect(tokenStore.readRefreshToken()).resolves.toBe("stored");
  });
});
