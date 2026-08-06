import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const jwt = (claims: Record<string, unknown>): string => {
  const payload = btoa(JSON.stringify(claims))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `header.${payload}.signature`;
};

const load = async () => {
  vi.resetModules();

  return import("./sessionStore");
};

beforeEach(() => {
  vi.resetModules();
});

describe("sessionStore", () => {
  it("getSessionState_beforeAnything_isUnknown", async () => {
    const { getSessionState } = await load();

    expect(getSessionState()).toEqual({ status: "unknown", session: undefined });
  });

  it("markAuthenticated_validToken_exposesTheClaims", async () => {
    const { getSessionState, markAuthenticated } = await load();

    markAuthenticated(jwt({ sub: "u-1", email: "ana@peaker.app" }));

    expect(getSessionState()).toEqual({
      status: "authenticated",
      session: { userId: "u-1", email: "ana@peaker.app" },
    });
  });

  it("markAuthenticated_undecodableToken_fallsBackToAnonymous", async () => {
    const { getSessionState, markAuthenticated } = await load();

    markAuthenticated("not-a-jwt");

    expect(getSessionState().status).toBe("anonymous");
  });

  it("markAnonymous_afterASession_clearsIt", async () => {
    const { getSessionState, markAnonymous, markAuthenticated } = await load();
    markAuthenticated(jwt({ sub: "u-1", email: "ana@peaker.app" }));

    markAnonymous();

    expect(getSessionState()).toEqual({ status: "anonymous", session: undefined });
  });

  it("getSessionState_withoutChanges_keepsTheSameReference", async () => {
    const { getSessionState, markAuthenticated } = await load();
    markAuthenticated(jwt({ sub: "u-1", email: "ana@peaker.app" }));

    expect(getSessionState()).toBe(getSessionState());
  });

  it("subscribeSession_onChange_notifiesListeners", async () => {
    const { markAnonymous, subscribeSession } = await load();
    const listener = vi.fn();
    subscribeSession(listener);

    markAnonymous();

    expect(listener).toHaveBeenCalledOnce();
  });

  it("useSessionState_whenTheSessionChanges_rerendersWithTheNewState", async () => {
    const { markAnonymous, markAuthenticated, useSessionState } = await load();
    const { result } = renderHook(() => useSessionState());
    expect(result.current.status).toBe("unknown");

    act(() => {
      markAuthenticated(jwt({ sub: "u-7", email: "leo@peaker.app" }));
    });
    expect(result.current.session).toEqual({
      userId: "u-7",
      email: "leo@peaker.app",
    });

    act(() => {
      markAnonymous();
    });
    expect(result.current.status).toBe("anonymous");
  });

  it("subscribeSession_afterUnsubscribing_stopsNotifying", async () => {
    const { markAnonymous, subscribeSession } = await load();
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    unsubscribe();
    markAnonymous();

    expect(listener).not.toHaveBeenCalled();
  });
});
