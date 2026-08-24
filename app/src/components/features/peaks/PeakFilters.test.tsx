import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { PeakQuery } from "@/app/[locale]/(public)/peaks/searchParams";

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }));

const { PeakFilters } = await import("./PeakFilters");

const emptyQuery: PeakQuery = {
  q: "",
  page: 1,
  country: "",
  region: "",
  minAltitude: "",
  maxAltitude: "",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PeakFilters", () => {
  it("peakFilters_noActiveFilters_showsNoChips", () => {
    render(<PeakFilters query={emptyQuery} />, { wrapper: IntlWrapper });

    expect(screen.queryByRole("button", { name: /Remove filter/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
  });

  it("peakFilters_activeCountry_showsARemovableChipWithItsTranslatedName", () => {
    render(<PeakFilters query={{ ...emptyQuery, country: "ES" }} />, {
      wrapper: IntlWrapper,
    });

    expect(
      screen.getByRole("button", { name: "Remove filter Spain" }),
    ).toBeInTheDocument();
  });

  it("peakFilters_removingAChip_dropsThatFilterOnly", async () => {
    render(
      <PeakFilters query={{ ...emptyQuery, country: "ES", region: "Pyrenees" }} />,
      { wrapper: IntlWrapper },
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Spain" }),
    );

    expect(push).toHaveBeenCalledWith("/peaks?region=Pyrenees");
  });

  it("peakFilters_clearAll_dropsEveryFilterButKeepsTheSearchTerm", async () => {
    render(
      <PeakFilters
        query={{ ...emptyQuery, q: "aneto", country: "ES", region: "Pyrenees" }}
      />,
      { wrapper: IntlWrapper },
    );

    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(push).toHaveBeenCalledWith("/peaks?q=aneto");
  });

  it("peakFilters_changingAFilterFromDeepPagination_returnsToTheFirstPage", async () => {
    render(
      <PeakFilters query={{ ...emptyQuery, page: 7, country: "ES" }} />,
      { wrapper: IntlWrapper },
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Spain" }),
    );

    expect(push).toHaveBeenCalledWith("/peaks");
  });

  it("peakFilters_regionSubmitted_appliesTheTypedValue", async () => {
    render(<PeakFilters query={emptyQuery} />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByLabelText("Region"), "Alps{Enter}");

    expect(push).toHaveBeenCalledWith("/peaks?region=Alps");
  });

  it("peakFilters_countrySelect_isLabelledForScreenReaders", () => {
    render(<PeakFilters query={emptyQuery} />, { wrapper: IntlWrapper });

    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("peakFilters_typingWithoutSearching_leavesTheListUntouched", async () => {
    render(<PeakFilters query={emptyQuery} />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByLabelText("Region"), "Alps");
    await userEvent.clear(screen.getByLabelText("Minimum altitude"));
    await userEvent.type(screen.getByLabelText("Minimum altitude"), "2500");

    expect(push).not.toHaveBeenCalled();
  });

  it("peakFilters_searchButton_appliesRegionAndAltitudeTogether", async () => {
    render(<PeakFilters query={emptyQuery} />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByLabelText("Region"), "Alps");
    await userEvent.clear(screen.getByLabelText("Minimum altitude"));
    await userEvent.type(screen.getByLabelText("Minimum altitude"), "2500");
    await userEvent.click(screen.getByRole("button", { name: "Search with these filters" }));

    expect(push).toHaveBeenCalledWith("/peaks?region=Alps&minAltitude=2500");
  });

  it("peakFilters_altitudeAboveTheBound_isClampedBeforeSearching", async () => {
    render(<PeakFilters query={emptyQuery} />, { wrapper: IntlWrapper });

    await userEvent.clear(screen.getByLabelText("Maximum altitude"));
    await userEvent.type(screen.getByLabelText("Maximum altitude"), "50000");
    await userEvent.click(screen.getByRole("button", { name: "Search with these filters" }));

    expect(push).toHaveBeenCalledWith("/peaks");
  });

  it("peakFilters_invertedAltitudeBounds_areReorderedBeforeSearching", async () => {
    render(<PeakFilters query={emptyQuery} />, { wrapper: IntlWrapper });

    await userEvent.clear(screen.getByLabelText("Minimum altitude"));
    await userEvent.type(screen.getByLabelText("Minimum altitude"), "4000");
    await userEvent.clear(screen.getByLabelText("Maximum altitude"));
    await userEvent.type(screen.getByLabelText("Maximum altitude"), "2000");
    await userEvent.click(screen.getByRole("button", { name: "Search with these filters" }));

    expect(push).toHaveBeenCalledWith(
      "/peaks?minAltitude=2000&maxAltitude=4000",
    );
  });

  it("peakFilters_clearAll_alsoEmptiesTheRegionAndAltitudeControls", async () => {
    render(
      <PeakFilters
        query={{
          ...emptyQuery,
          region: "Pyrenees",
          minAltitude: "2500",
          maxAltitude: "4000",
        }}
      />,
      { wrapper: IntlWrapper },
    );

    await userEvent.type(screen.getByLabelText("Region"), " north");
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.getByLabelText("Region")).toHaveValue("");
    expect(screen.getByLabelText("Minimum altitude")).toHaveValue(0);
    expect(screen.getByLabelText("Maximum altitude")).toHaveValue(9000);
    expect(screen.getByText("From 0 to 9000 metres")).toBeInTheDocument();
  });

  it("peakFilters_removingTheAltitudeChip_restoresTheDefaultBounds", async () => {
    render(
      <PeakFilters
        query={{ ...emptyQuery, minAltitude: "2500", maxAltitude: "4000" }}
      />,
      { wrapper: IntlWrapper },
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter From 2500 to 4000 metres" }),
    );

    expect(screen.getByLabelText("Minimum altitude")).toHaveValue(0);
    expect(screen.getByLabelText("Maximum altitude")).toHaveValue(9000);
  });
});
