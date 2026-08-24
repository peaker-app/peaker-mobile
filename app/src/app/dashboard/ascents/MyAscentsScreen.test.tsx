import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { AscentSummaryResponse, PagedResponse } from "@/types/api";

const push = vi.fn();

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

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

const { MyAscentsScreen } = await import("./MyAscentsScreen");
const { usePreferences } = await import("@/stores/preferences");

const ascent = (
  overrides: Partial<AscentSummaryResponse> = {},
): AscentSummaryResponse => ({
  id: "a-1",
  peakId: "peak-1",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  ascentDate: "2026-07-20",
  visibility: "Public",
  thumbnailUrl: null,
  ...overrides,
});

const page = (
  items: AscentSummaryResponse[],
  overrides: Partial<PagedResponse<AscentSummaryResponse>> = {},
): PagedResponse<AscentSummaryResponse> => ({
  items,
  page: 1,
  size: 20,
  totalCount: items.length,
  totalPages: 1,
  ...overrides,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

const requestedUrls = (): string[] =>
  fetchMock.mock.calls.map((call) => String(call[0]));

beforeEach(() => {
  usePreferences.setState({ ascentListView: "cards" });
  fetchMock.mockResolvedValue(jsonResponse(page([ascent()])));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("MyAscentsScreen", () => {
  it("myAscentsScreen_firstPage_asksForTwentyPerPage", async () => {
    renderWithProviders(<MyAscentsScreen />, { route: "/dashboard/ascents" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(requestedUrls()[0]).toBe(
      "http://localhost:8080/api/ascents?page=1&size=20",
    );
  });

  it("myAscentsScreen_pageInTheUrl_travelsToTheGateway", async () => {
    renderWithProviders(<MyAscentsScreen />, {
      route: "/dashboard/ascents?page=3",
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(requestedUrls()[0]).toBe(
      "http://localhost:8080/api/ascents?page=3&size=20",
    );
  });

  it("myAscentsScreen_unusablePage_fallsBackToTheFirstOne", async () => {
    renderWithProviders(<MyAscentsScreen />, {
      route: "/dashboard/ascents?page=zero",
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(requestedUrls()[0]).toBe(
      "http://localhost:8080/api/ascents?page=1&size=20",
    );
  });

  it("myAscentsScreen_loading_showsOneSkeletonPerExpectedRow", () => {
    renderWithProviders(<MyAscentsScreen />, { route: "/dashboard/ascents" });

    expect(screen.getAllByRole("listitem")).toHaveLength(20);
  });

  it("myAscentsScreen_results_showTheVisibilityOfEachAscent", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(page([ascent(), ascent({ id: "a-2", visibility: "Private" })])),
    );

    renderWithProviders(<MyAscentsScreen />, { route: "/dashboard/ascents" });

    expect(await screen.findByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("myAscentsScreen_noAscents_offersTheFirstSummit", async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([])));

    renderWithProviders(<MyAscentsScreen />, { route: "/dashboard/ascents" });

    expect(
      await screen.findByText("You haven't logged any summit yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Log your first summit" }),
    ).toHaveAttribute("href", "/dashboard/ascents/new");
  });

  it("myAscentsScreen_pageOutOfRange_takesTheUserBackToTheFirstPage", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ title: "Pagination.PageOutOfRange" }, 400),
    );

    renderWithProviders(<MyAscentsScreen />, {
      route: "/dashboard/ascents?page=999",
    });

    await userEvent.click(
      await screen.findByRole("button", { name: "Try again" }),
    );

    expect(push).toHaveBeenCalledWith("/dashboard/ascents");
  });

  it("myAscentsScreen_domainFailure_doesNotOfferARetry", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Ascent.NotOwned" }, 403));

    renderWithProviders(<MyAscentsScreen />, { route: "/dashboard/ascents" });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("myAscentsScreen_always_offersTheShortcutToLogASummit", async () => {
    renderWithProviders(<MyAscentsScreen />, { route: "/dashboard/ascents" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByRole("link", { name: "Log a summit" })).toHaveAttribute(
      "href",
      "/dashboard/ascents/new",
    );
  });
});
