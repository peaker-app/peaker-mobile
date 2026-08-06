import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clampRadius,
  defaultAttribution,
  defaultTileUrl,
  isLatitude,
  isLongitude,
  isRadius,
  maxRadiusMeters,
  minRadiusMeters,
  tileAttribution,
  tileUrl,
} from "./map";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("tileUrl", () => {
  it("tileUrl_withoutConfiguration_fallsBackToOpenStreetMap", () => {
    expect(tileUrl()).toBe(defaultTileUrl);
  });

  it("tileUrl_configuredProvider_isUsed", () => {
    vi.stubEnv("VITE_MAP_TILE_URL", "https://tiles.example/{z}/{x}/{y}.png");

    expect(tileUrl()).toBe("https://tiles.example/{z}/{x}/{y}.png");
  });

  it("tileAttribution_withoutConfiguration_creditsOpenStreetMap", () => {
    expect(tileAttribution()).toBe(defaultAttribution);
  });
});

describe("isLatitude", () => {
  it.each([-90, 0, 45.8326, 90])("isLatitude_%s_isValid", (value) => {
    expect(isLatitude(value)).toBe(true);
  });

  it.each([-90.1, 90.1, Number.NaN, Number.POSITIVE_INFINITY])(
    "isLatitude_%s_isRejected",
    (value) => {
      expect(isLatitude(value)).toBe(false);
    },
  );
});

describe("isLongitude", () => {
  it.each([-180, 0, 6.8652, 180])("isLongitude_%s_isValid", (value) => {
    expect(isLongitude(value)).toBe(true);
  });

  it.each([-180.1, 180.1, Number.NaN])("isLongitude_%s_isRejected", (value) => {
    expect(isLongitude(value)).toBe(false);
  });
});

describe("isRadius", () => {
  it.each([1, 25_000, maxRadiusMeters])("isRadius_%s_isValid", (value) => {
    expect(isRadius(value)).toBe(true);
  });

  it.each([0, -1, maxRadiusMeters + 1, Number.NaN])(
    "isRadius_%s_isRejected",
    (value) => {
      expect(isRadius(value)).toBe(false);
    },
  );
});

describe("clampRadius", () => {
  it("clampRadius_belowTheMinimum_isRaised", () => {
    expect(clampRadius(10)).toBe(minRadiusMeters);
  });

  it("clampRadius_aboveTheMaximum_isCapped", () => {
    expect(clampRadius(500_000)).toBe(maxRadiusMeters);
  });

  it("clampRadius_withinRange_isUnchanged", () => {
    expect(clampRadius(25_000)).toBe(25_000);
  });
});
