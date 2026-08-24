import { describe, expect, it } from "vitest";
import { isWikidataId, localizedPeakName, peakDisplayName } from "./peakName";

const unnamed = (id: string) => `Unnamed peak (${id})`;

const matterhorn = {
  name: "Matterhorn",
  alternativeNames: [
    { languageCode: "it", name: "Cervino", isOfficial: true },
    { languageCode: "es", name: "Cervino", isOfficial: false },
    { languageCode: "fr", name: "Mont Cervin", isOfficial: true },
    { languageCode: "fr", name: "Le Cervin", isOfficial: false },
  ],
};

describe("localizedPeakName", () => {
  it("localizedPeakName_officialLabelForLocale_winsOverAlias", () => {
    expect(localizedPeakName(matterhorn, "fr")).toBe("Mont Cervin");
  });

  it("localizedPeakName_onlyAliasForLocale_usesTheAlias", () => {
    expect(localizedPeakName(matterhorn, "es")).toBe("Cervino");
  });

  it.each(["zh", "ar"] as const)(
    "localizedPeakName_%sWithoutIngestedNames_fallsBackToTheCanonical",
    (locale) => {
      expect(localizedPeakName(matterhorn, locale)).toBe("Matterhorn");
    },
  );

  it("localizedPeakName_noAlternativeNames_returnsTheCanonical", () => {
    expect(
      localizedPeakName({ name: "Aneto", alternativeNames: [] }, "es"),
    ).toBe("Aneto");
  });

  it("localizedPeakName_english_returnsTheCanonical", () => {
    expect(localizedPeakName(matterhorn, "en")).toBe("Matterhorn");
  });
});

describe("isWikidataId", () => {
  it.each(["Q8538208", "Q1", "Q20619616"])(
    "isWikidataId_%s_isRecognisedAsAnIdentifier",
    (value) => {
      expect(isWikidataId(value)).toBe(true);
    },
  );

  it.each(["Aneto", "image1", "Q0", "Q", "Q12a", "QA", "31Q", "Pico Q1"])(
    "isWikidataId_%s_isTreatedAsARealName",
    (value) => {
      expect(isWikidataId(value)).toBe(false);
    },
  );
});

describe("peakDisplayName", () => {
  it("peakDisplayName_realName_isShownUntouched", () => {
    expect(peakDisplayName("Aneto", unnamed)).toBe("Aneto");
  });

  it("peakDisplayName_oddButRealName_isStillPreferredOverThePlaceholder", () => {
    expect(peakDisplayName("image1", unnamed)).toBe("image1");
  });

  it("peakDisplayName_wikidataIdentifier_becomesThePlaceholder", () => {
    expect(peakDisplayName("Q8538208", unnamed)).toBe(
      "Unnamed peak (Q8538208)",
    );
  });

  it("peakDisplayName_wikidataIdentifierAfterLocalisation_stillCarriesTheIdentifier", () => {
    const peak = { name: "Q123", alternativeNames: [] };

    expect(peakDisplayName(localizedPeakName(peak, "es"), unnamed)).toBe(
      "Unnamed peak (Q123)",
    );
  });
});
