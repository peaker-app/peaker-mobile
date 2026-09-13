import { correlationHeader, newCorrelationId } from "@/lib/api/correlation";
import { endpoints } from "@/lib/api/endpoints";
import { gatewayUrl } from "@/lib/api/gateway";
import type { AuthTokensResponse } from "@/types/api";
import { isAccessTokenUsable } from "./accessToken";
import { getSessionState } from "./sessionStore";
import {
  clearTokens,
  getAccessToken,
  persistTokens,
  readRefreshToken,
} from "./tokenStore";

let inFlight: Promise<AuthTokensResponse | undefined> | undefined;

type RotationOutcome =
  | { status: "rotated"; tokens: AuthTokensResponse }
  | { status: "rejected" }
  | { status: "unreachable" };

const rejectedStatuses = new Set([401, 403]);

const requestNewTokens = async (
  refreshToken: string,
): Promise<RotationOutcome> => {
  let response: Response;

  try {
    response = await fetch(`${gatewayUrl()}/api/${endpoints.auth.refresh}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [correlationHeader]: newCorrelationId(),
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return { status: "unreachable" };
  }

  if (response.ok) {
    return {
      status: "rotated",
      tokens: (await response.json()) as AuthTokensResponse,
    };
  }

  return rejectedStatuses.has(response.status)
    ? { status: "rejected" }
    : { status: "unreachable" };
};

const applyOutcome = async (
  outcome: RotationOutcome,
): Promise<AuthTokensResponse | undefined> => {
  if (outcome.status === "rejected") {
    await clearTokens();
  }

  if (outcome.status !== "rotated") {
    return undefined;
  }

  await persistTokens(outcome.tokens);

  return outcome.tokens;
};

const rotate = async (): Promise<AuthTokensResponse | undefined> => {
  const refreshToken = await readRefreshToken();

  return refreshToken
    ? applyOutcome(await requestNewTokens(refreshToken))
    : undefined;
};

export const refreshSession = (): Promise<AuthTokensResponse | undefined> => {
  inFlight ??= rotate().finally(() => {
    inFlight = undefined;
  });

  return inFlight;
};

export const ensureFreshAccessToken = async (): Promise<void> => {
  if (
    getSessionState().status !== "authenticated" ||
    isAccessTokenUsable(getAccessToken())
  ) {
    return;
  }

  await refreshSession();
};
