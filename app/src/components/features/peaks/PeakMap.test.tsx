import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { usePreferences } from "@/stores/preferences";
import type { PeakMapViewProps } from "./PeakMapView";

vi.mock("./PeakMapView", () => ({
  default: ({ points, zoom }: PeakMapViewProps) => (
    <p>{`points:${points.length} zoom:${zoom ?? "auto"}`}</p>
  ),
}));

const { PeakMap } = await import("./PeakMap");

const point = { id: "p-1", latitude: 42.63, longitude: 0.65 };

const allowMaps = () => usePreferences.setState({ mapsConsent: true });

beforeEach(() => vi.stubEnv("VITE_MAP_ENABLED", "true"));

afterEach(() => {
  usePreferences.setState({ mapsConsent: false });
  vi.unstubAllEnvs();
});

describe("PeakMap", () => {
  it("peakMap_withConsent_loadsTheLeafletViewLazily", async () => {
    allowMaps();
    render(<PeakMap points={[point]} zoom={11} />, { wrapper: IntlWrapper });

    expect(await screen.findByText("points:1 zoom:11")).toBeInTheDocument();
  });

  it("peakMap_withConsent_carriesATextualAlternative", async () => {
    allowMaps();
    render(<PeakMap points={[point]} />, { wrapper: IntlWrapper });

    expect(
      await screen.findByText(
        "The map is decorative: every peak is listed below with its coordinates.",
      ),
    ).toBeInTheDocument();
  });

  it("peakMap_withoutConsent_neverMountsTheTileView", () => {
    render(<PeakMap points={[point]} zoom={11} />, { wrapper: IntlWrapper });

    expect(screen.queryByText("points:1 zoom:11")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Load the map" }),
    ).toBeInTheDocument();
  });

  it("peakMap_loadingItOnce_showsTheMapWithoutStoringConsent", async () => {
    const user = userEvent.setup();
    render(<PeakMap points={[point]} zoom={11} />, { wrapper: IntlWrapper });

    await user.click(screen.getByRole("button", { name: "Load the map" }));

    expect(await screen.findByText("points:1 zoom:11")).toBeInTheDocument();
    expect(usePreferences.getState().mapsConsent).toBe(false);
  });
});

describe("PeakMap sin proveedor de teselas", () => {
  it("peakMap_withMapsDisabled_rendersNothing", () => {
    vi.stubEnv("VITE_MAP_ENABLED", "false");
    allowMaps();
    const { container } = render(<PeakMap points={[point]} zoom={11} />, {
      wrapper: IntlWrapper,
    });

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("points:1 zoom:11")).not.toBeInTheDocument();
  });
});
