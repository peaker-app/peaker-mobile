import { describe, expect, it } from "vitest";
import { decodeAccessToken } from "./accessToken";

const toBase64Url = (claims: Record<string, unknown>): string => {
  const utf8 = new TextEncoder().encode(JSON.stringify(claims));
  const binary = String.fromCharCode(...utf8);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const encode = (claims: Record<string, unknown>): string =>
  `header.${toBase64Url(claims)}.signature`;

describe("decodeAccessToken without Buffer", () => {
  it("decodeAccessToken_nonAsciiEmail_keepsTheAccents", () => {
    const token = encode({ sub: "u-1", email: "montañero@peaker.app" });

    expect(decodeAccessToken(token)?.email).toBe("montañero@peaker.app");
  });

  it("decodeAccessToken_multibyteClaims_areNotCorrupted", () => {
    const token = encode({ sub: "u-2", email: "珠穆朗玛@peaker.app" });

    expect(decodeAccessToken(token)?.email).toBe("珠穆朗玛@peaker.app");
  });

  it("decodeAccessToken_payloadWithoutPadding_isAccepted", () => {
    const token = encode({ sub: "u-3", email: "a@b.co" });
    const payload = token.split(".")[1] ?? "";

    expect(payload.endsWith("=")).toBe(false);
    expect(decodeAccessToken(token)?.userId).toBe("u-3");
  });

  it("decodeAccessToken_base64UrlAlphabet_isNormalised", () => {
    const token = encode({ sub: "u-4?>", email: "sub~with?chars@peaker.app" });

    expect(decodeAccessToken(token)?.userId).toBe("u-4?>");
  });
});
