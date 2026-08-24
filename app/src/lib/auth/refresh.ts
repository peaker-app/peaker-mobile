import { correlationHeader, newCorrelationId } from "@/lib/api/correlation";
import { endpoints } from "@/lib/api/endpoints";
import { gatewayUrl } from "@/lib/api/gateway";
import type { AuthTokensResponse } from "@/types/api";
import { clearTokens, persistTokens, readRefreshToken } from "./tokenStore";

let inFlight: Promise<AuthTokensResponse | undefined> | undefined;

type RotationOutcome =
  | { status: "rotated"; tokens: AuthTokensResponse }
  | { status: "rejected" }
  | { status: "unreachable" };

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

  return response.ok
    ? { status: "rotated", tokens: (await response.json()) as AuthTokensResponse }
    : { status: "rejected" };
};

const rotate = async (): Promise<AuthTokensResponse | undefined> => {
  const refreshToken = await readRefreshToken();

  if (!refreshToken) {
    return undefined;
  }

  const outcome = await requestNewTokens(refreshToken);

  if (outcome.status === "rejected") {
    await clearTokens();
  }

  if (outcome.status !== "rotated") {
    return undefined;
  }

  await persistTokens(outcome.tokens);

  return outcome.tokens;
};

export const refreshSession = (): Promise<AuthTokensResponse | undefined> => {
  inFlight ??= rotate().finally(() => {
    inFlight = undefined;
  });

  return inFlight;
};
