import { vi } from "vitest";
import type { AuthTokensResponse } from "@/types/api";

export const gatewayOrigin = "http://localhost:8080";

export const jwt = (claims: Record<string, unknown>): string => {
  const payload = btoa(JSON.stringify(claims))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `header.${payload}.signature`;
};

export const tokens = (
  overrides: Partial<AuthTokensResponse> = {},
): AuthTokensResponse => ({
  accessToken: jwt({ sub: "u-1", email: "ana@peaker.app" }),
  refreshToken: "refresh-1",
  expiresInSeconds: 900,
  tokenType: "Bearer",
  ...overrides,
});

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const emptyResponse = (status: number): Response =>
  new Response(null, { status });

export const alwaysJson =
  (body: unknown, status = 200) =>
  (): Promise<Response> =>
    Promise.resolve(jsonResponse(body, status));

export const loadAuth = async () => {
  vi.resetModules();
  vi.stubEnv("VITE_GATEWAY_URL", gatewayOrigin);

  const [secureStorage, sessionStore, tokenStore, refresh, session, client] =
    await Promise.all([
      import("@/lib/native/secureStorage"),
      import("@/lib/auth/sessionStore"),
      import("@/lib/auth/tokenStore"),
      import("@/lib/auth/refresh"),
      import("@/lib/auth/session"),
      import("@/lib/api/client"),
    ]);

  return { secureStorage, sessionStore, tokenStore, refresh, session, client };
};

export const requestOf = (call: unknown[]): { url: string; init: RequestInit } => ({
  url: String(call[0]),
  init: (call[1] ?? {}) as RequestInit,
});

export const headerOf = (init: RequestInit, name: string): string | undefined =>
  new Headers(init.headers).get(name) ?? undefined;
