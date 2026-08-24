import { describe, expect, it } from "vitest";
import { defaultLocale, getDirection, isLocale, locales } from "./config";

describe("locales", () => {
  it("locales_mvpCatalogue_containsTheFiveSupportedLanguages", () => {
    expect([...locales]).toEqual(["en", "es", "zh", "fr", "ar"]);
  });

  it("defaultLocale_matchesTheCanonicalDataLanguage", () => {
    expect(defaultLocale).toBe("en");
  });
});

describe("getDirection", () => {
  it("getDirection_arabic_isRightToLeft", () => {
    expect(getDirection("ar")).toBe("rtl");
  });

  it.each(["en", "es", "zh", "fr"] as const)(
    "getDirection_%s_isLeftToRight",
    (locale) => {
      expect(getDirection(locale)).toBe("ltr");
    },
  );
});

describe("isLocale", () => {
  it.each([...locales])("isLocale_supported%s_returnsTrue", (locale) => {
    expect(isLocale(locale)).toBe(true);
  });

  it.each(["de", "pt", "EN", ""])(
    "isLocale_unsupported_returnsFalse",
    (value) => {
      expect(isLocale(value)).toBe(false);
    },
  );
});
