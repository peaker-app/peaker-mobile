import { correlationHeader, newCorrelationId } from "@/lib/api/correlation";
import { endpoints } from "@/lib/api/endpoints";
import { gatewayUrl } from "@/lib/api/gateway";
import type { AuthTokensResponse } from "@/types/api";
import { clearTokens, persistTokens, readRefreshToken } from "./tokenStore";

let inFlight: Promise<AuthTokensResponse | undefined> | undefined;

const requestNewTokens = async (
  refreshToken: string,
): Promise<AuthTokensResponse | undefined> => {
  const response = await fetch(
    `${gatewayUrl()}/api/${endpoints.auth.refresh}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [correlationHeader]: newCorrelationId(),
      },
      body: JSON.stringify({ refreshToken }),
    },
  );

  return response.ok
    ? ((await response.json()) as AuthTokensResponse)
    : undefined;
};

const rotate = async (): Promise<AuthTokensResponse | undefined> => {
  const refreshToken = await readRefreshToken();

  if (!refreshToken) {
    return undefined;
  }

  const tokens = await requestNewTokens(refreshToken);

  if (!tokens) {
    await clearTokens();

    return undefined;
  }

  await persistTokens(tokens);

  return tokens;
};

export const refreshSession = (): Promise<AuthTokensResponse | undefined> => {
  inFlight ??= rotate().finally(() => {
    inFlight = undefined;
  });

  return inFlight;
};
