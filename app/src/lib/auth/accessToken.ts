export interface AccessTokenClaims {
  userId: string;
  email: string;
  expiresAtMs: number | undefined;
}

interface RawClaims {
  sub?: string;
  email?: string;
  exp?: number;
}

const decodeBase64Url = (value: string): string => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64.padEnd(base64.length + padding, "="));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

const parsePayload = (token: string): RawClaims | undefined => {
  const payload = token.split(".")[1];

  if (!payload) {
    return undefined;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as RawClaims;
  } catch {
    return undefined;
  }
};

export const decodeAccessToken = (
  token: string,
): AccessTokenClaims | undefined => {
  const claims = parsePayload(token);

  if (!claims?.sub) {
    return undefined;
  }

  return {
    userId: claims.sub,
    email: claims.email ?? "",
    expiresAtMs: claims.exp === undefined ? undefined : claims.exp * 1000,
  };
};

export const isAccessTokenUsable = (token: string | undefined): boolean => {
  if (!token) {
    return false;
  }

  const claims = decodeAccessToken(token);

  return (
    claims !== undefined &&
    (claims.expiresAtMs === undefined || claims.expiresAtMs > Date.now())
  );
};
