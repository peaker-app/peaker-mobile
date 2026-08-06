import { describe, expect, it } from "vitest";
import { countryCodes, countryName, countryOptions, isKnownCountry } from "./countries";

describe("countryCodes", () => {
  it("countryCodes_everyEntry_isAnIsoAlpha2Code", () => {
    for (const code of countryCodes) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("countryCodes_hasNoDuplicates", () => {
    expect(new Set(countryCodes).size).toBe(countryCodes.length);
  });
});

describe("countryName", () => {
  it("countryName_english_usesIntlDisplayNames", () => {
    expect(countryName("en", "ES")).toBe("Spain");
  });

  it("countryName_spanish_isTranslatedByTheRuntime", () => {
    expect(countryName("es", "ES")).toBe("España");
  });

  it("countryName_unmappedCode_fallsBackToTheCodeItself", () => {
    expect(countryName("en", "QQ")).toBe("QQ");
  });
});

describe("countryOptions", () => {
  it("countryOptions_anyLocale_returnsOneOptionPerCode", () => {
    expect(countryOptions("en")).toHaveLength(countryCodes.length);
  });

  it("countryOptions_areSortedByTheirTranslatedLabel", () => {
    const labels = countryOptions("en").map((option) => option.label);

    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, "en")));
  });
});

describe("isKnownCountry", () => {
  it("isKnownCountry_catalogueCode_returnsTrue", () => {
    expect(isKnownCountry("FR")).toBe(true);
  });

  it("isKnownCountry_codeOutsideTheCatalogue_returnsFalse", () => {
    expect(isKnownCountry("QQ")).toBe(false);
  });
});
