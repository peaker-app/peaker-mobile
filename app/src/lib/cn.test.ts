import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("cn_conflictingUtilities_keepsTheLastOne", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("cn_conditionalValues_skipsFalsyOnes", () => {
    expect(cn("rounded-md", false, undefined, "border")).toBe(
      "rounded-md border",
    );
  });

  it("cn_logicalDirectionUtilities_areNotMergedWithEachOther", () => {
    expect(cn("ms-2", "me-4")).toBe("ms-2 me-4");
  });
});
