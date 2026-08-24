import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { PeakQuery } from "@/app/[locale]/(public)/peaks/searchParams";
import { renderWithProviders } from "@/test/renderWithProviders";
import { PeakFiltersSheet } from "./PeakFiltersSheet";

const emptyQuery: PeakQuery = {
  q: "",
  page: 1,
  country: "",
  region: "",
  minAltitude: "",
  maxAltitude: "",
};

const openSheet = async () => {
  await userEvent.click(screen.getByRole("button", { name: /^Filters/ }));
};

describe("PeakFiltersSheet", () => {
  it("peakFiltersSheet_noActiveFilters_showsThePlainHeading", () => {
    renderWithProviders(<PeakFiltersSheet query={emptyQuery} />, {
      route: "/peaks",
    });

    expect(
      screen.getByRole("button", { name: "Filters" }),
    ).toBeInTheDocument();
  });

  it("peakFiltersSheet_activeFilters_areCountedOnTheTrigger", () => {
    renderWithProviders(
      <PeakFiltersSheet
        query={{ ...emptyQuery, country: "ES", minAltitude: "3000" }}
      />,
      { route: "/peaks?country=ES&minAltitude=3000" },
    );

    expect(
      screen.getByRole("button", { name: "Filters (2)" }),
    ).toBeInTheDocument();
  });

  it("peakFiltersSheet_searchTermAlone_isNotCountedAsAFilter", () => {
    renderWithProviders(<PeakFiltersSheet query={{ ...emptyQuery, q: "aneto" }} />, {
      route: "/peaks?q=aneto",
    });

    expect(
      screen.getByRole("button", { name: "Filters" }),
    ).toBeInTheDocument();
  });

  it("peakFiltersSheet_opened_revealsTheFilters", async () => {
    renderWithProviders(<PeakFiltersSheet query={emptyQuery} />, {
      route: "/peaks",
    });

    await openSheet();

    expect(screen.getByLabelText("Region")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("peakFiltersSheet_done_closesItWithoutNavigating", async () => {
    renderWithProviders(<PeakFiltersSheet query={emptyQuery} />, {
      route: "/peaks",
    });

    await openSheet();
    await userEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => expect(screen.queryByLabelText("Region")).toBeNull());
  });

  it("peakFiltersSheet_applyingAFilter_closesItOverTheNewResults", async () => {
    renderWithProviders(<PeakFiltersSheet query={emptyQuery} />, {
      route: "/peaks",
    });

    await openSheet();
    await userEvent.type(screen.getByLabelText("Region"), "Alps");
    await userEvent.click(
      screen.getByRole("button", { name: "Search with these filters" }),
    );

    await waitFor(() => expect(screen.queryByLabelText("Region")).toBeNull());
  });
});
