import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAuth, tokens } from "@/test/authHarness";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("tokenStore", () => {
  it("getAccessToken_beforeSignIn_isUndefined", async () => {
    const { tokenStore } = await loadAuth();

    expect(tokenStore.getAccessToken()).toBeUndefined();
  });

  it("persistTokens_keepsTheAccessTokenInMemoryOnly", async () => {
    const { secureStorage, tokenStore } = await loadAuth();
    const pair = tokens();

    await tokenStore.persistTokens(pair);

    expect(tokenStore.getAccessToken()).toBe(pair.accessToken);
    await expect(
      secureStorage.secureStore.get(tokenStore.refreshTokenKey),
    ).resolves.toBe(pair.refreshToken);
  });

  it("persistTokens_publishesTheSession", async () => {
    const { sessionStore, tokenStore } = await loadAuth();

    await tokenStore.persistTokens(tokens());

    expect(sessionStore.getSessionState()).toEqual({
      status: "authenticated",
      session: { userId: "u-1", email: "ana@peaker.app" },
    });
  });

  it("readRefreshToken_afterPersisting_returnsIt", async () => {
    const { tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens({ refreshToken: "refresh-9" }));

    await expect(tokenStore.readRefreshToken()).resolves.toBe("refresh-9");
  });

  it("clearTokens_dropsBothTokensAndGoesAnonymous", async () => {
    const { sessionStore, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());

    await tokenStore.clearTokens();

    expect(tokenStore.getAccessToken()).toBeUndefined();
    await expect(tokenStore.readRefreshToken()).resolves.toBeUndefined();
    expect(sessionStore.getSessionState().status).toBe("anonymous");
  });
});
