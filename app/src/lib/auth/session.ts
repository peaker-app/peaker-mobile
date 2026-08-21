import { ApiError, readProblem } from "@/lib/api/client";
import { correlationHeader, newCorrelationId } from "@/lib/api/correlation";
import { endpoints } from "@/lib/api/endpoints";
import { gatewayUrl } from "@/lib/api/gateway";
import type { AuthTokensResponse, LoginRequest } from "@/types/api";
import { refreshSession } from "./refresh";
import {
  getSessionState,
  markAnonymous,
  type SessionState,
} from "./sessionStore";
import {
  clearTokens,
  getAccessToken,
  persistTokens,
  readRefreshToken,
} from "./tokenStore";

export {
  useSessionState,
  type Session,
  type SessionState,
  type SessionStatus,
} from "./sessionStore";

const authHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  [correlationHeader]: newCorrelationId(),
});

export const signIn = async (credentials: LoginRequest): Promise<void> => {
  const response = await fetch(`${gatewayUrl()}/api/${endpoints.auth.login}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new ApiError(await readProblem(response));
  }

  await persistTokens((await response.json()) as AuthTokensResponse);
};

const revoke = (refreshToken: string, accessToken: string): Promise<Response> =>
  fetch(`${gatewayUrl()}/api/${endpoints.auth.logout}`, {
    method: "POST",
    headers: { ...authHeaders(), Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ refreshToken }),
  });

export const signOut = async (): Promise<void> => {
  const refreshToken = await readRefreshToken();
  const accessToken = getAccessToken();

  if (refreshToken && accessToken) {
    await revoke(refreshToken, accessToken).catch(() => undefined);
  }

  await clearTokens();
};

const revokeEverySession = (accessToken: string): Promise<Response> =>
  fetch(`${gatewayUrl()}/api/${endpoints.auth.logoutAll}`, {
    method: "POST",
    headers: { ...authHeaders(), Authorization: `Bearer ${accessToken}` },
  });

export const signOutEverywhere = async (): Promise<void> => {
  const accessToken = getAccessToken();

  if (accessToken) {
    await revokeEverySession(accessToken).catch(() => undefined);
  }

  await clearTokens();
};

export const restoreSession = async (): Promise<SessionState> => {
  if (!(await refreshSession())) {
    markAnonymous();
  }

  return getSessionState();
};
