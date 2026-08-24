import { describe, expect, it } from "vitest";
import {
  dashboardPath,
  resolveNextPath,
  sanitizeNextPath,
  stripLocalePrefix,
} from "./nextPath";

describe("sanitizeNextPath", () => {
  it.each(["/dashboard", "/es/dashboard/ascents/new?peakId=1", "/"])(
    "sanitizeNextPath_relativePath_%s_isAccepted",
    (value) => {
      expect(sanitizeNextPath(value)).toBe(value);
    },
  );

  it.each([
    "//evil.com",
    "///evil.com",
    "https://evil.com",
    "http://evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "javascript:alert(1)",
    "dashboard",
  ])("sanitizeNextPath_openRedirect_%s_isRejected", (value) => {
    expect(sanitizeNextPath(value)).toBeUndefined();
  });

  it.each([undefined, null, ""])(
    "sanitizeNextPath_missingValue_returnsUndefined",
    (value) => {
      expect(sanitizeNextPath(value)).toBeUndefined();
    },
  );
});

describe("stripLocalePrefix", () => {
  it("stripLocalePrefix_prefixedPath_dropsTheLocale", () => {
    expect(stripLocalePrefix("/es/dashboard/ascents", "es")).toBe(
      "/dashboard/ascents",
    );
  });

  it("stripLocalePrefix_bareLocale_becomesTheRoot", () => {
    expect(stripLocalePrefix("/ar", "ar")).toBe("/");
  });

  it("stripLocalePrefix_otherLocale_isLeftAlone", () => {
    expect(stripLocalePrefix("/fr/dashboard", "es")).toBe("/fr/dashboard");
  });

  it("stripLocalePrefix_similarSegment_isNotTruncated", () => {
    expect(stripLocalePrefix("/estadisticas", "es")).toBe("/estadisticas");
  });
});

describe("resolveNextPath", () => {
  it("resolveNextPath_safePrefixedPath_isUnprefixedForTheLocalisedRouter", () => {
    expect(resolveNextPath("/es/dashboard/ascents", "es")).toBe(
      "/dashboard/ascents",
    );
  });

  it("resolveNextPath_openRedirect_fallsBackToTheDashboard", () => {
    expect(resolveNextPath("//evil.com", "en")).toBe(dashboardPath);
  });

  it("resolveNextPath_noDestination_fallsBackToTheDashboard", () => {
    expect(resolveNextPath(undefined, "en")).toBe(dashboardPath);
  });
});
