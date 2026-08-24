import { describe, expect, it } from "vitest";
import { clamp } from "./number";

describe("clamp", () => {
  it("clamp_valueInsideTheRange_isKept", () => {
    expect(clamp(25, 1, 200)).toBe(25);
  });

  it("clamp_valueBelowTheMinimum_risesToTheMinimum", () => {
    expect(clamp(-4, 1, 200)).toBe(1);
  });

  it("clamp_valueAboveTheMaximum_dropsToTheMaximum", () => {
    expect(clamp(5000, 1, 200)).toBe(200);
  });

  it("clamp_valueOnABound_isKept", () => {
    expect(clamp(200, 1, 200)).toBe(200);
  });
});
