import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { PeakDetailResponse } from "@/types/api";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

vi.mock("@/lib/native/camera", () => ({
  picker: {
    takePhoto: vi.fn().mockResolvedValue({ status: "cancelled" }),
    chooseFromGallery: vi.fn().mockResolvedValue({ status: "cancelled" }),
  },
  remainingSlots: (taken: number) => Math.max(3 - taken, 1),
}));

const { NewAscentScreen } = await import("./NewAscentScreen");

const peak: PeakDetailResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Aneto",
  altitudeMeters: 3404,
  prominenceMeters: 2812,
  latitude: 42.6318,
  longitude: 0.6555,
  countryCode: "ES",
  region: "Pyrenees",
  imageUrl: null,
  rangeId: null,
  rangeName: null,
  alternativeNames: [],
};

const fetchMock = vi.spyOn(globalThis, "fetch");

const requestedUrls = (): string[] =>
  fetchMock.mock.calls.map((call) => String(call[0]));

beforeEach(() => {
  fetchMock.mockResolvedValue(jsonResponse(peak));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("NewAscentScreen", () => {
  it("newAscentScreen_withoutAPeakId_asksForNothingAndShowsTheEmptyCombobox", async () => {
    renderWithProviders(<NewAscentScreen />, {
      route: "/dashboard/ascents/new",
    });

    expect(
      await screen.findByPlaceholderText("Start typing a name…"),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("newAscentScreen_withAPeakId_preselectsThatPeak", async () => {
    renderWithProviders(<NewAscentScreen />, {
      route: `/dashboard/ascents/new?peakId=${peak.id}`,
    });

    expect(await screen.findByText("Selected: Aneto")).toBeInTheDocument();
    await waitFor(() =>
      expect(requestedUrls()[0]).toBe(
        `http://localhost:8080/api/peaks/${peak.id}`,
      ),
    );
  });

  it("newAscentScreen_unknownPeakId_stillLetsTheHikerPickOne", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Peak.NotFound" }, 404));

    renderWithProviders(<NewAscentScreen />, {
      route: `/dashboard/ascents/new?peakId=${peak.id}`,
    });

    expect(
      await screen.findByPlaceholderText("Start typing a name…"),
    ).toBeInTheDocument();
  });

  it("newAscentScreen_always_offersBothPhotoSources", async () => {
    renderWithProviders(<NewAscentScreen />, {
      route: "/dashboard/ascents/new",
    });

    expect(
      await screen.findByRole("button", { name: "Take a photo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose from gallery" }),
    ).toBeInTheDocument();
  });

  it("newAscentScreen_render_showsTheTitleAndTheSubmitAction", async () => {
    renderWithProviders(<NewAscentScreen />, {
      route: "/dashboard/ascents/new",
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Log a summit" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save ascent" }),
    ).toBeInTheDocument();
  });
});
