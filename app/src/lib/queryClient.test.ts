import { describe, expect, it } from "vitest";
import { queryClient } from "./queryClient";

const retryDelay = () => {
  const { retryDelay: delay } = queryClient.getDefaultOptions().queries ?? {};

  if (typeof delay !== "function") {
    throw new Error("retryDelay is not configured as a function");
  }

  return delay;
};

describe("queryClient", () => {
  it("retryDelay_earlyAttempts_backsOffExponentially", () => {
    const delay = retryDelay();

    expect(delay(0, new Error("boom"))).toBe(1000);
    expect(delay(1, new Error("boom"))).toBe(2000);
    expect(delay(2, new Error("boom"))).toBe(4000);
  });

  it("retryDelay_lateAttempts_isCappedAtEightSeconds", () => {
    const delay = retryDelay();

    expect(delay(3, new Error("boom"))).toBe(8000);
    expect(delay(10, new Error("boom"))).toBe(8000);
  });

  it("mutations_byDefault_doNotRetry", () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
  });
});
