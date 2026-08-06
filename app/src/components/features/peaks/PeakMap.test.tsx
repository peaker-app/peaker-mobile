import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { PeakMapViewProps } from "./PeakMapView";

vi.mock("./PeakMapView", () => ({
  default: ({ points, zoom }: PeakMapViewProps) => (
    <p>{`points:${points.length} zoom:${zoom ?? "auto"}`}</p>
  ),
}));

const { PeakMap } = await import("./PeakMap");

const point = { id: "p-1", latitude: 42.63, longitude: 0.65 };

describe("PeakMap", () => {
  it("peakMap_mounted_loadsTheLeafletViewLazily", async () => {
    render(<PeakMap points={[point]} zoom={11} />, { wrapper: IntlWrapper });

    expect(
      await screen.findByText("points:1 zoom:11"),
    ).toBeInTheDocument();
  });

  it("peakMap_always_carriesATextualAlternative", async () => {
    render(<PeakMap points={[point]} />, { wrapper: IntlWrapper });

    expect(
      await screen.findByText(
        "The map is decorative: every peak is listed below with its coordinates.",
      ),
    ).toBeInTheDocument();
  });
});
