import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { PeakDetailResponse } from "@/types/api";
import { PeakFactsList } from "./PeakFactsList";

const montBlanc: PeakDetailResponse = {
  id: "peak-1",
  name: "Mont Blanc",
  altitudeMeters: 4808,
  prominenceMeters: 4696,
  latitude: 45.8326,
  longitude: 6.8652,
  countryCode: "FR",
  region: "Haute-Savoie",
  imageUrl: null,
  rangeId: "range-1",
  rangeName: "Alps",
  alternativeNames: [],
};

const withoutOptionals: PeakDetailResponse = {
  ...montBlanc,
  prominenceMeters: null,
  countryCode: null,
  region: null,
  rangeId: null,
  rangeName: null,
};

describe("PeakFactsList", () => {
  it("peakFactsList_completePeak_showsEveryFact", () => {
    render(<PeakFactsList peak={montBlanc} />, { wrapper: IntlWrapper });

    expect(screen.getByText("4,808 m")).toBeInTheDocument();
    expect(screen.getByText("4,696 m")).toBeInTheDocument();
    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Alps")).toBeInTheDocument();
  });

  it("peakFactsList_nullValues_areOmittedNotShownAsADash", () => {
    render(<PeakFactsList peak={withoutOptionals} />, { wrapper: IntlWrapper });

    expect(screen.queryByText("Prominence")).toBeNull();
    expect(screen.queryByText("Country")).toBeNull();
    expect(screen.queryByText("Mountain range")).toBeNull();
    expect(screen.queryByText("—")).toBeNull();
  });

  it("peakFactsList_coordinates_areMachineReadableAndLtr", () => {
    const { container } = render(<PeakFactsList peak={montBlanc} />, {
      wrapper: IntlWrapper,
    });
    const coordinates = container.querySelector("data");

    expect(coordinates).toHaveAttribute("value", "45.8326,6.8652");
    expect(coordinates).toHaveAttribute("dir", "ltr");
  });

  it("peakFactsList_facts_useARealDescriptionList", () => {
    const { container } = render(<PeakFactsList peak={montBlanc} />, {
      wrapper: IntlWrapper,
    });

    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(container.querySelectorAll("dt").length).toBeGreaterThan(0);
  });

  it("peakFactsList_externalMapLink_opensSafely", () => {
    render(<PeakFactsList peak={montBlanc} />, { wrapper: IntlWrapper });

    expect(screen.getByRole("link", { name: "Open in a map" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });
});
