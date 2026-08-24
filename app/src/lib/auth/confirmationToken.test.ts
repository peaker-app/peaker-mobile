import { describe, expect, it } from "vitest";
import { extractConfirmationToken } from "./confirmationToken";

const token = "0hEO-3nQrVQwWZ0mQ0oNqA_lE0z3kQ1nJ4rC7xTgYbU";

describe("extractConfirmationToken", () => {
  it("extractConfirmationToken_bareToken_returnsItUnchanged", () => {
    expect(extractConfirmationToken(token)).toBe(token);
  });

  it("extractConfirmationToken_surroundingWhitespace_isTrimmed", () => {
    expect(extractConfirmationToken(`  ${token}\n`)).toBe(token);
  });

  it("extractConfirmationToken_fullEmailLink_returnsOnlyTheToken", () => {
    expect(
      extractConfirmationToken(
        `http://localhost:3000/confirm-email?token=${token}`,
      ),
    ).toBe(token);
  });

  it("extractConfirmationToken_linkWithTrailingParams_stopsAtTheAmpersand", () => {
    expect(
      extractConfirmationToken(
        `https://peaker.app/confirm-email?token=${token}&utm=email`,
      ),
    ).toBe(token);
  });

  it("extractConfirmationToken_percentEncodedValue_isDecoded", () => {
    expect(
      extractConfirmationToken("https://peaker.app/confirm-email?token=a%2Bb"),
    ).toBe("a+b");
  });

  it("extractConfirmationToken_emptyInput_returnsUndefined", () => {
    expect(extractConfirmationToken("   ")).toBeUndefined();
  });
});
