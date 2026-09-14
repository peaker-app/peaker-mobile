import { secureStore } from "@/lib/native/secureStorage";
import type { AuthTokensResponse } from "@/types/api";
import { markAnonymous, markAuthenticated } from "./sessionStore";

export const refreshTokenKey = "peaker.refreshToken";

let accessToken: string | undefined;

export const getAccessToken = (): string | undefined => accessToken;

export const readRefreshToken = async (): Promise<string | undefined> => {
  try {
    return await secureStore.get(refreshTokenKey);
  } catch {
    return undefined;
  }
};

export const persistTokens = async (
  tokens: AuthTokensResponse,
): Promise<void> => {
  accessToken = tokens.accessToken;
  markAuthenticated(tokens.accessToken);

  try {
    await secureStore.set(refreshTokenKey, tokens.refreshToken);
  } catch {
    return;
  }
};

export const clearTokens = async (): Promise<void> => {
  accessToken = undefined;
  markAnonymous();

  try {
    await secureStore.remove(refreshTokenKey);
  } catch {
    return;
  }
};
