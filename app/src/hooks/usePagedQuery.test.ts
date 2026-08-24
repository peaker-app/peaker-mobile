import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/client";
import { shouldRetry } from "./usePagedQuery";

const apiError = (status: number): ApiError => new ApiError({ status });

describe("shouldRetry", () => {
  it.each([500, 502, 503, 504])(
    "shouldRetry_transient%iError_retries",
    (status) => {
      expect(shouldRetry(0, apiError(status))).toBe(true);
    },
  );

  it.each([400, 401, 403, 404, 409, 429])(
    "shouldRetry_domainResponse%i_doesNotRetry",
    (status) => {
      expect(shouldRetry(0, apiError(status))).toBe(false);
    },
  );

  it("shouldRetry_afterTwoAttempts_stops", () => {
    expect(shouldRetry(1, apiError(503))).toBe(true);
    expect(shouldRetry(2, apiError(503))).toBe(false);
  });

  it("shouldRetry_nonApiError_doesNotRetry", () => {
    expect(shouldRetry(0, new Error("network"))).toBe(false);
  });
});
