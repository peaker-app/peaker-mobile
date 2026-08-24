import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { ProfileStatsResponse } from "@/types/api";
import { StatsGrid } from "./StatsGrid";

const stats: ProfileStatsResponse = {
  totalAscents: 12,
  distinctPeaks: 9,
  highestAltitudeMeters: 4808,
  highestPeakId: "peak-1",
  highestPeakName: "Mont Blanc",
  lastAscentDate: "2026-07-20",
};

describe("StatsGrid", () => {
  it("statsGrid_anyStats_rendersTheFourFigures", () => {
    render(<StatsGrid stats={stats} />, { wrapper: IntlWrapper });

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("4,808")).toBeInTheDocument();
  });

  it("statsGrid_bigNumber_carriesItsLabelInTheAccessibleName", () => {
    render(<StatsGrid stats={stats} />, { wrapper: IntlWrapper });

    expect(
      screen.getByLabelText("Total ascents: 12"),
    ).toBeInTheDocument();
  });

  it("statsGrid_publicProfile_labelsThatOnlyPublicAscentsCount", () => {
    render(<StatsGrid stats={stats} note="Public ascents only" />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByText("Public ascents only")).toBeInTheDocument();
  });

  it("statsGrid_noAscentsYet_showsTheEmptyLabelInsteadOfADate", () => {
    render(
      <StatsGrid
        stats={{
          totalAscents: 0,
          distinctPeaks: 0,
          highestAltitudeMeters: 0,
          highestPeakId: null,
          highestPeakName: null,
          lastAscentDate: null,
        }}
      />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByText("None yet")).toBeInTheDocument();
  });

  it("statsGrid_everyFigure_isADescriptionList", () => {
    const { container } = render(<StatsGrid stats={stats} />, {
      wrapper: IntlWrapper,
    });

    expect(container.querySelectorAll("dl")).toHaveLength(4);
  });
});
