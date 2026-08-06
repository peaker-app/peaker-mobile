import { afterEach, describe, expect, it, vi } from "vitest";
import {
  alwaysJson,
  emptyResponse,
  gatewayOrigin,
  jsonResponse,
  loadAuth,
  tokens,
} from "@/test/authHarness";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("refreshSession", () => {
  it("refreshSession_withoutAStoredToken_neverCallsTheGateway", async () => {
    const { refresh } = await loadAuth();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(refresh.refreshSession()).resolves.toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refreshSession_success_persistsTheRotatedPair", async () => {
    const { refresh, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens({ refreshToken: "old" }));
    const rotated = tokens({ accessToken: "header.e30.sig", refreshToken: "new" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(rotated));

    await refresh.refreshSession();

    await expect(tokenStore.readRefreshToken()).resolves.toBe("new");
  });

  it("refreshSession_postsTheStoredTokenToTheRefreshEndpoint", async () => {
    const { refresh, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens({ refreshToken: "old" }));
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(tokens()));

    await refresh.refreshSession();

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${gatewayOrigin}/api/auth/refresh`);
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ refreshToken: "old" }));
  });

  it("refreshSession_concurrentCallers_rotatesOnlyOnce", async () => {
    const { refresh, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(tokens()));

    const [first, second] = await Promise.all([
      refresh.refreshSession(),
      refresh.refreshSession(),
    ]);

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(first).toEqual(second);
  });

  it("refreshSession_afterCompletion_allowsANewRotation", async () => {
    const { refresh, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(alwaysJson(tokens()));

    await refresh.refreshSession();
    await refresh.refreshSession();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("refreshSession_rejectedByTheGateway_clearsTheSession", async () => {
    const { refresh, sessionStore, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    vi.spyOn(globalThis, "fetch").mockResolvedValue(emptyResponse(401));

    await expect(refresh.refreshSession()).resolves.toBeUndefined();

    expect(tokenStore.getAccessToken()).toBeUndefined();
    await expect(tokenStore.readRefreshToken()).resolves.toBeUndefined();
    expect(sessionStore.getSessionState().status).toBe("anonymous");
  });

  it("refreshSession_afterAFailure_doesNotRetryWithADeadToken", async () => {
    const { refresh, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(emptyResponse(500));

    await refresh.refreshSession();
    await refresh.refreshSession();

    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});
