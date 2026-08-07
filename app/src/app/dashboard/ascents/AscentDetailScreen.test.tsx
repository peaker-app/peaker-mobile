import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { AscentResponse } from "@/types/api";

let search = "";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return {
    ...actual,
    useParams: () => ({ id: "a-1" }),
    useSearchParams: () => [new URLSearchParams(search), vi.fn()],
  };
});

vi.mock("@/lib/native/camera", () => ({
  picker: {
    takePhoto: vi.fn().mockResolvedValue({ status: "cancelled" }),
    chooseFromGallery: vi.fn().mockResolvedValue({ status: "cancelled" }),
  },
  remainingSlots: (taken: number) => Math.max(3 - taken, 1),
}));

const { AscentDetailScreen } = await import("./AscentDetailScreen");

const ascent = (overrides: Partial<AscentResponse> = {}): AscentResponse => ({
  id: "a-1",
  userId: "u-1",
  peakId: "peak-1",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  ascentDate: "2026-07-20",
  companions: "Ana, Luis",
  routeNotes: "Vía normal",
  conditions: { snow: "Patchy", wind: "Moderate", trail: "Good" },
  visibility: "Public",
  photos: [],
  ...overrides,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  search = "";
  fetchMock.mockResolvedValue(jsonResponse(ascent()));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AscentDetailScreen", () => {
  it("ascentDetailScreen_loaded_showsTheHeadlineAndTheVisibility", async () => {
    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Aneto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("ascentDetailScreen_loaded_linksToTheEditScreen", async () => {
    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    expect(await screen.findByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/dashboard/ascents/a-1/edit",
    );
  });

  it("ascentDetailScreen_publicAscent_offersItsPublicPage", async () => {
    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    expect(
      await screen.findByRole("link", { name: "See the public page" }),
    ).toHaveAttribute("href", "/ascents/a-1");
  });

  it("ascentDetailScreen_privateAscent_hasNoPublicPageToOffer", async () => {
    fetchMock.mockResolvedValue(jsonResponse(ascent({ visibility: "Private" })));

    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    await screen.findByRole("heading", { level: 1, name: "Aneto" });
    expect(screen.queryByRole("link", { name: "See the public page" })).toBeNull();
  });

  it("ascentDetailScreen_withoutPendingPhotos_showsNoWarning", async () => {
    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    await screen.findByRole("heading", { level: 1, name: "Aneto" });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("ascentDetailScreen_photosFailedInTheUrl_warnsWithoutLosingTheAscent", async () => {
    search = "photosFailed=2";

    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1?photosFailed=2",
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "2 photos couldn't be uploaded",
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Aneto" }),
    ).toBeInTheDocument();
  });

  it("ascentDetailScreen_unusablePhotosFailed_isIgnored", async () => {
    search = "photosFailed=nope";

    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1?photosFailed=nope",
    });

    await screen.findByRole("heading", { level: 1, name: "Aneto" });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("ascentDetailScreen_loaded_managesPhotosAndLinksToThePeak", async () => {
    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    expect(
      await screen.findByRole("button", { name: "Take a photo" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Aneto" })).toHaveAttribute(
      "href",
      "/peaks/peak-1",
    );
  });

  it("ascentDetailScreen_notFound_showsTheNotFoundScreen", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Ascent.NotFound" }, 404));

    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    expect(await screen.findByText("404")).toBeInTheDocument();
  });

  it("ascentDetailScreen_notOwned_isAnErrorWithoutRetry", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Ascent.NotOwned" }, 403));

    renderWithProviders(<AscentDetailScreen />, {
      route: "/dashboard/ascents/a-1",
    });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});
