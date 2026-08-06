import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { PeakDetailResponse } from "@/types/api";

vi.mock("@/components/features/peaks/PeakMap", () => ({
  PeakMap: () => null,
}));

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => ({ status: "anonymous", session: undefined }),
}));

const { PeakDetailScreen } = await import("./PeakDetailScreen");

const peakId = "11111111-1111-1111-1111-111111111111";

const detail = (
  overrides: Partial<PeakDetailResponse> = {},
): PeakDetailResponse => ({
  id: peakId,
  name: "Aneto",
  altitudeMeters: 3404,
  prominenceMeters: 2812,
  latitude: 42.6318,
  longitude: 0.6555,
  countryCode: "ES",
  region: "Pyrenees",
  imageUrl: null,
  rangeId: null,
  rangeName: "Pyrenees",
  alternativeNames: [],
  ...overrides,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

const renderAt = (route: string, locale?: "es") =>
  renderWithProviders(
    <Routes>
      <Route path="peaks/:id" element={<PeakDetailScreen />} />
    </Routes>,
    { route, locale },
  );

const renderDetail = () => renderAt(`/peaks/${peakId}`);

beforeEach(() => {
  fetchMock.mockResolvedValue(jsonResponse(detail()));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PeakDetailScreen", () => {
  it("peakDetailScreen_loaded_asksTheGatewayForThatPeak", async () => {
    renderDetail();

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "Aneto",
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      `http://localhost:8080/api/peaks/${peakId}`,
    );
  });

  it("peakDetailScreen_localisedName_prefersTheOfficialAlternative", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        detail({
          alternativeNames: [
            { languageCode: "es", name: "Pico de Aneto", isOfficial: true },
          ],
        }),
      ),
    );

    renderAt(`/peaks/${peakId}`, "es");

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "Pico de Aneto",
    );
    expect(screen.getByText("También conocido como Aneto")).toBeInTheDocument();
  });

  it("peakDetailScreen_wikidataIdAsName_neverShowsTheRawIdentifier", async () => {
    fetchMock.mockResolvedValue(jsonResponse(detail({ name: "Q8538208" })));

    renderDetail();

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "Unnamed peak (Q8538208)",
    );
    expect(screen.queryByText(/Also known as/)).toBeNull();
  });

  it("peakDetailScreen_withoutAPhoto_rendersNoImage", async () => {
    renderDetail();

    await screen.findByRole("heading", { level: 1 });

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("peakDetailScreen_withAPhoto_showsItLabelledWithTheName", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        detail({
          imageUrl:
            "https://commons.wikimedia.org/wiki/Special:FilePath/Aneto.jpg",
        }),
      ),
    );

    renderDetail();

    expect(await screen.findByRole("img", { name: "Aneto" })).toBeInTheDocument();
  });

  it("peakDetailScreen_alternativeNames_carryTheirLanguage", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        detail({
          alternativeNames: [
            { languageCode: "fr", name: "Pic d'Aneto", isOfficial: false },
          ],
        }),
      ),
    );

    renderDetail();

    expect(await screen.findByText("Pic d'Aneto")).toHaveAttribute("lang", "fr");
  });

  it("peakDetailScreen_unknownPeak_landsOnTheNotFoundScreen", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Peak.NotFound" }, 404));

    renderDetail();

    expect(
      await screen.findByRole("heading", { name: "This page doesn't exist" }),
    ).toBeInTheDocument();
  });

  it("peakDetailScreen_malformedId_alsoLandsOnTheNotFoundScreen", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    renderAt("/peaks/not-a-guid");

    expect(
      await screen.findByRole("heading", { name: "This page doesn't exist" }),
    ).toBeInTheDocument();
  });

  it("peakDetailScreen_domainFailure_showsAnErrorWithoutARetry", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Boom" }, 400));

    renderDetail();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});
