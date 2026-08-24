import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { PagedResponse, PeakListItemResponse } from "@/types/api";

const push = vi.fn();

vi.mock("@/i18n/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("@/i18n/navigation")>(
      "@/i18n/navigation",
    );

  return {
    ...actual,
    useRouter: () => ({
      push,
      replace: vi.fn(),
      back: vi.fn(),
      refresh: vi.fn(),
    }),
  };
});

const { PeaksScreen } = await import("./PeaksScreen");

const peak = (
  overrides: Partial<PeakListItemResponse> = {},
): PeakListItemResponse => ({
  id: "11111111-1111-1111-1111-111111111111",
  name: "Aneto",
  altitudeMeters: 3404,
  prominenceMeters: 2812,
  latitude: 42.6318,
  longitude: 0.6555,
  countryCode: "ES",
  region: "Pyrenees",
  imageUrl: null,
  imageAuthor: null,
  imageLicense: null,
  ...overrides,
});

const page = (
  items: PeakListItemResponse[],
  overrides: Partial<PagedResponse<PeakListItemResponse>> = {},
): PagedResponse<PeakListItemResponse> => ({
  items,
  page: 1,
  size: 24,
  totalCount: items.length,
  totalPages: 1,
  ...overrides,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

const requestedUrls = (): string[] =>
  fetchMock.mock.calls.map((call) => String(call[0]));

beforeEach(() => {
  fetchMock.mockResolvedValue(jsonResponse(page([peak()])));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PeaksScreen", () => {
  it("peaksScreen_noSearchTerm_listsTheCatalogueWithTheScreenPageSize", async () => {
    renderWithProviders(<PeaksScreen />, { route: "/peaks" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(requestedUrls()[0]).toBe(
      "http://localhost:8080/api/peaks?page=1&size=24",
    );
  });

  it("peaksScreen_searchTerm_switchesToTheSearchEndpoint", async () => {
    renderWithProviders(<PeaksScreen />, { route: "/peaks?q=aneto" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(requestedUrls()[0]).toBe(
      "http://localhost:8080/api/peaks/search?q=aneto&page=1&size=24",
    );
  });

  it("peaksScreen_activeFilters_travelAsQueryParams", async () => {
    renderWithProviders(<PeaksScreen />, {
      route: "/peaks?country=ES&minAltitude=3000&page=2",
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(requestedUrls()[0]).toBe(
      "http://localhost:8080/api/peaks?country=ES&minAltitude=3000&page=2&size=24",
    );
  });

  it("peaksScreen_loading_showsOneSkeletonPerExpectedResult", () => {
    renderWithProviders(<PeaksScreen />, { route: "/peaks" });

    expect(screen.getAllByRole("listitem")).toHaveLength(24);
  });

  it("peaksScreen_results_areAnnouncedAndListed", async () => {
    renderWithProviders(<PeaksScreen />, { route: "/peaks" });

    expect(await screen.findByText("1 result")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Aneto, 3,404 metres" }),
    ).toBeInTheDocument();
  });

  it("peaksScreen_noMatchForTheSearchTerm_isEmptyNotAnError", async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([])));

    renderWithProviders(<PeaksScreen />, { route: "/peaks?q=nothing" });

    expect(
      await screen.findByText('No peaks match "nothing"'),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("peaksScreen_emptyCatalogue_explainsTheIngestion", async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([])));

    renderWithProviders(<PeaksScreen />, { route: "/peaks" });

    expect(
      await screen.findByText("The catalogue has no peaks yet."),
    ).toBeInTheDocument();
  });

  it("peaksScreen_transientFailure_isRetriedTwiceAndThenOffersARetry", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Boom" }, 503));

    renderWithProviders(<PeaksScreen />, { route: "/peaks" });

    expect(await screen.findByRole("alert", {}, { timeout: 10_000 })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  }, 15_000);

  it("peaksScreen_domainFailure_doesNotOfferARetry", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ title: "Peak.CountryCodeInvalid" }, 400),
    );

    renderWithProviders(<PeaksScreen />, { route: "/peaks?country=ESP" });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("peaksScreen_pageOutOfRange_takesTheUserBackToTheFirstPage", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ title: "Pagination.PageOutOfRange" }, 400),
    );

    renderWithProviders(<PeaksScreen />, { route: "/peaks?q=aneto&page=999" });

    await userEvent.click(await screen.findByRole("button", { name: "Try again" }));

    expect(push).toHaveBeenCalledWith("/peaks?q=aneto");
  });

  it("peaksScreen_always_offersTheNearbyScreen", async () => {
    renderWithProviders(<PeaksScreen />, { route: "/peaks" });

    expect(await screen.findByRole("link", { name: "Nearby" })).toHaveAttribute(
      "href",
      "/peaks/nearby",
    );
  });
});
