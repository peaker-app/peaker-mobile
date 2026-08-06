import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  parsePeakQuery,
  toQueryString,
  type PeakQuery,
} from "./searchParams";

const emptyQuery: PeakQuery = {
  q: "",
  page: 1,
  country: "",
  region: "",
  minAltitude: "",
  maxAltitude: "",
};

describe("parsePeakQuery", () => {
  it("parsePeakQuery_noParams_returnsTheCleanView", () => {
    expect(parsePeakQuery({})).toEqual(emptyQuery);
  });

  it("parsePeakQuery_allParams_areRead", () => {
    expect(
      parsePeakQuery({
        q: "aneto",
        page: "3",
        country: "ES",
        region: "Pirineos",
        minAltitude: "2000",
        maxAltitude: "3500",
      }),
    ).toEqual({
      q: "aneto",
      page: 3,
      country: "ES",
      region: "Pirineos",
      minAltitude: "2000",
      maxAltitude: "3500",
    });
  });

  it("parsePeakQuery_repeatedParam_takesTheFirstValue", () => {
    expect(parsePeakQuery({ q: ["aneto", "teide"] }).q).toBe("aneto");
  });

  it.each(["0", "-4", "abc", ""])(
    "parsePeakQuery_invalidPage_%s_fallsBackToOne",
    (page) => {
      expect(parsePeakQuery({ page }).page).toBe(1);
    },
  );

  it("parsePeakQuery_surroundingSpaces_areTrimmed", () => {
    expect(parsePeakQuery({ q: "  aneto  " }).q).toBe("aneto");
  });
});

describe("activeFilterCount", () => {
  it("activeFilterCount_noFilters_isZero", () => {
    expect(activeFilterCount(emptyQuery)).toBe(0);
  });

  it("activeFilterCount_searchTermAlone_isNotCountedAsAFilter", () => {
    expect(activeFilterCount({ ...emptyQuery, q: "aneto" })).toBe(0);
  });

  it("activeFilterCount_countryAndAltitude_countsBoth", () => {
    expect(
      activeFilterCount({ ...emptyQuery, country: "ES", minAltitude: "2000" }),
    ).toBe(2);
  });
});

describe("toQueryString", () => {
  it("toQueryString_cleanView_isEmpty", () => {
    expect(toQueryString(emptyQuery)).toBe("");
  });

  it("toQueryString_anyFilterChange_resetsThePage", () => {
    expect(toQueryString({ ...emptyQuery, page: 7, country: "ES" })).toBe(
      "?country=ES",
    );
  });

  it("toQueryString_explicitPagination_keepsThePage", () => {
    expect(toQueryString({ ...emptyQuery, page: 4 }, false)).toBe("?page=4");
  });

  it("toQueryString_firstPage_isNeverWrittenToTheUrl", () => {
    expect(toQueryString({ ...emptyQuery, page: 1 }, false)).toBe("");
  });

  it("toQueryString_searchAndFilters_travelTogether", () => {
    expect(
      toQueryString({
        ...emptyQuery,
        q: "aneto",
        country: "ES",
        minAltitude: "2000",
      }),
    ).toBe("?q=aneto&country=ES&minAltitude=2000");
  });
});
