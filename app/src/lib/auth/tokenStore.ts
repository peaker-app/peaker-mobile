import { secureStore } from "@/lib/native/secureStorage";
import type { AuthTokensResponse } from "@/types/api";
import { markAnonymous, markAuthenticated } from "./sessionStore";

export const refreshTokenKey = "peaker.refreshToken";

let accessToken: string | undefined;

export const getAccessToken = (): string | undefined => accessToken;

export const readRefreshToken = (): Promise<string | undefined> =>
  secureStore.get(refreshTokenKey);

export const persistTokens = async (
  tokens: AuthTokensResponse,
): Promise<void> => {
  accessToken = tokens.accessToken;
  await secureStore.set(refreshTokenKey, tokens.refreshToken);
  markAuthenticated(tokens.accessToken);
};

export const clearTokens = async (): Promise<void> => {
  accessToken = undefined;
  await secureStore.remove(refreshTokenKey);
  markAnonymous();
};
