import { describe, expect, it } from "vitest";
import {
  formatAltitude,
  formatCoordinate,
  formatDistance,
  parseDateOnly,
  toDateOnly,
} from "./format";

describe("formatAltitude", () => {
  it("formatAltitude_arabicLocale_usesLatinDigits", () => {
    expect(formatAltitude("ar", 4808)).toMatch(/^[\d,.\s ]+$/);
  });

  it("formatAltitude_spanishLocale_groupsThousands", () => {
    expect(formatAltitude("es", 4808)).toContain("808");
  });
});

describe("formatCoordinate", () => {
  it("formatCoordinate_anyLocale_keepsFiveDecimals", () => {
    expect(formatCoordinate("en", 45.8326)).toBe("45.83260");
  });

  it("formatCoordinate_arabicLocale_usesLatinDigits", () => {
    expect(formatCoordinate("ar", 6.8652)).toMatch(/^[\d,.\s ]+$/);
  });
});

describe("formatDistance", () => {
  it("formatDistance_underOneKilometer_returnsMeters", () => {
    expect(formatDistance("en", 850)).toEqual({ unit: "meters", value: "850" });
  });

  it("formatDistance_overOneKilometer_returnsKilometersWithOneDecimal", () => {
    expect(formatDistance("en", 12340)).toEqual({
      unit: "kilometers",
      value: "12.3",
    });
  });

  it("formatDistance_exactlyOneKilometer_returnsKilometers", () => {
    expect(formatDistance("en", 1000).unit).toBe("kilometers");
  });
});

describe("parseDateOnly", () => {
  it("parseDateOnly_dateOnlyString_buildsLocalDateWithoutShifting", () => {
    const parsed = parseDateOnly("2026-07-20");

    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(6);
    expect(parsed?.getDate()).toBe(20);
  });

  it("parseDateOnly_malformedString_returnsUndefined", () => {
    expect(parseDateOnly("20/07/2026")).toBeUndefined();
    expect(parseDateOnly("2026-07-xx")).toBeUndefined();
  });

  it("parseDateOnly_roundTrip_preservesTheSameDay", () => {
    const value = "1999-01-05";

    expect(toDateOnly(parseDateOnly(value) as Date)).toBe(value);
  });
});
