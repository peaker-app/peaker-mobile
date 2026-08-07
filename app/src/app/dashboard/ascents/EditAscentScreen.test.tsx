import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { AscentResponse } from "@/types/api";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return { ...actual, useParams: () => ({ id: "a-1" }) };
});

const { EditAscentScreen } = await import("./EditAscentScreen");

const ascent: AscentResponse = {
  id: "a-1",
  userId: "u-1",
  peakId: "peak-1",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  ascentDate: "2026-07-20",
  companions: "Ana, Luis",
  routeNotes: "Vía normal",
  conditions: { snow: "Patchy", wind: "Moderate", trail: "Good" },
  visibility: "Private",
  photos: [],
};

const fetchMock = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  fetchMock.mockResolvedValue(jsonResponse(ascent));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("EditAscentScreen", () => {
  it("editAscentScreen_loaded_prefillsTheFormWithWhatWasSaved", async () => {
    renderWithProviders(<EditAscentScreen />, {
      route: "/dashboard/ascents/a-1/edit",
    });

    expect(await screen.findByDisplayValue("Ana, Luis")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Vía normal")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-07-20")).toBeInTheDocument();
  });

  it("editAscentScreen_loaded_showsThePeakAsReadOnlyWithTheReasonWhy", async () => {
    renderWithProviders(<EditAscentScreen />, {
      route: "/dashboard/ascents/a-1/edit",
    });

    expect(
      await screen.findByText("The peak can't be changed"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "To correct the peak, delete this ascent and log it again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Start typing a name…")).toBeNull();
  });

  it("editAscentScreen_loaded_hasNoPhotoSection", async () => {
    renderWithProviders(<EditAscentScreen />, {
      route: "/dashboard/ascents/a-1/edit",
    });

    await screen.findByDisplayValue("Ana, Luis");
    expect(screen.queryByRole("button", { name: "Take a photo" })).toBeNull();
  });

  it("editAscentScreen_loaded_offersTheDangerZone", async () => {
    renderWithProviders(<EditAscentScreen />, {
      route: "/dashboard/ascents/a-1/edit",
    });

    expect(await screen.findByText("Danger zone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete ascent" }),
    ).toBeInTheDocument();
  });

  it("editAscentScreen_loaded_breadcrumbWalksBackToTheDetail", async () => {
    renderWithProviders(<EditAscentScreen />, {
      route: "/dashboard/ascents/a-1/edit",
    });

    expect(await screen.findByRole("link", { name: "Aneto" })).toHaveAttribute(
      "href",
      "/dashboard/ascents/a-1",
    );
  });

  it("editAscentScreen_notFound_showsTheNotFoundScreen", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Ascent.NotFound" }, 404));

    renderWithProviders(<EditAscentScreen />, {
      route: "/dashboard/ascents/a-1/edit",
    });

    expect(await screen.findByText("404")).toBeInTheDocument();
  });

  it("editAscentScreen_notOwned_isAnErrorWithoutRetry", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Ascent.NotOwned" }, 403));

    renderWithProviders(<EditAscentScreen />, {
      route: "/dashboard/ascents/a-1/edit",
    });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});
