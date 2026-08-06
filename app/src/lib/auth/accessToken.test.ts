import { describe, expect, it } from "vitest";
import { decodeAccessToken, isAccessTokenUsable } from "./accessToken";

const encode = (payload: Record<string, unknown>): string =>
  `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;

const inSeconds = (offsetSeconds: number): number =>
  Math.floor(Date.now() / 1000) + offsetSeconds;

describe("decodeAccessToken", () => {
  it("decodeAccessToken_validToken_returnsSubAndEmail", () => {
    const token = encode({ sub: "user-1", email: "a@b.es", exp: inSeconds(900) });

    expect(decodeAccessToken(token)).toMatchObject({
      userId: "user-1",
      email: "a@b.es",
    });
  });

  it("decodeAccessToken_tokenWithoutSub_returnsUndefined", () => {
    expect(decodeAccessToken(encode({ email: "a@b.es" }))).toBeUndefined();
  });

  it("decodeAccessToken_malformedToken_returnsUndefined", () => {
    expect(decodeAccessToken("not-a-jwt")).toBeUndefined();
    expect(decodeAccessToken("header.###.signature")).toBeUndefined();
  });
});

describe("isAccessTokenUsable", () => {
  it("isAccessTokenUsable_futureExpiry_returnsTrue", () => {
    expect(isAccessTokenUsable(encode({ sub: "u", exp: inSeconds(900) }))).toBe(
      true,
    );
  });

  it("isAccessTokenUsable_pastExpiry_returnsFalse", () => {
    expect(isAccessTokenUsable(encode({ sub: "u", exp: inSeconds(-1) }))).toBe(
      false,
    );
  });

  it("isAccessTokenUsable_missingToken_returnsFalse", () => {
    expect(isAccessTokenUsable(undefined)).toBe(false);
  });
});
