import { describe, expect, it } from "vitest";
import { correlationHeader, newCorrelationId } from "./correlation";

describe("correlation", () => {
  it("correlationHeader_matchesTheBackendSerilogHeader", () => {
    expect(correlationHeader).toBe("X-Correlation-Id");
  });

  it("newCorrelationId_returnsAUuid", () => {
    expect(newCorrelationId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("newCorrelationId_calledTwice_returnsDifferentIds", () => {
    expect(newCorrelationId()).not.toBe(newCorrelationId());
  });
});
