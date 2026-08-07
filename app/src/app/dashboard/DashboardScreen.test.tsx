import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type {
  AscentSummaryResponse,
  PagedResponse,
  ProfileResponse,
  ProfileStatsResponse,
} from "@/types/api";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

const { DashboardScreen } = await import("./DashboardScreen");
const { useEmailConfirmation } = await import("@/stores/emailConfirmation");

const profile: ProfileResponse = {
  id: "p-1",
  userId: "u-1",
  displayName: "Ana",
  slug: "ana",
  bio: null,
  avatarUrl: null,
  countryCode: "ES",
  visibility: "Public",
};

const stats: ProfileStatsResponse = {
  totalAscents: 12,
  distinctPeaks: 9,
  highestAltitudeMeters: 3404,
  highestPeakId: "peak-1",
  highestPeakName: "Aneto",
  lastAscentDate: "2026-07-20",
};

const ascent: AscentSummaryResponse = {
  id: "a-1",
  peakId: "peak-1",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  ascentDate: "2026-07-20",
  visibility: "Public",
  thumbnailUrl: null,
};

const recent = (
  items: AscentSummaryResponse[],
): PagedResponse<AscentSummaryResponse> => ({
  items,
  page: 1,
  size: 5,
  totalCount: items.length,
  totalPages: 1,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

const routeTo = (
  responses: Partial<{ profile: Response; stats: Response; ascents: Response }>,
) => {
  fetchMock.mockImplementation((input) => {
    const url = String(input);

    if (url.includes("/profiles/me/stats")) {
      return Promise.resolve(responses.stats ?? jsonResponse(stats));
    }

    if (url.includes("/profiles/me")) {
      return Promise.resolve(responses.profile ?? jsonResponse(profile));
    }

    return Promise.resolve(responses.ascents ?? jsonResponse(recent([ascent])));
  });
};

beforeEach(() => {
  useEmailConfirmation.setState({ unconfirmed: false });
  routeTo({});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("DashboardScreen", () => {
  it("dashboardScreen_profileLoaded_greetsByName", async () => {
    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Hello, Ana" }),
    ).toBeInTheDocument();
  });

  it("dashboardScreen_profileMissing_stillShowsASingleHeading", async () => {
    routeTo({ profile: jsonResponse({ title: "Profile.NotFound" }, 404) });

    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Your activity" }),
    ).toBeInTheDocument();
  });

  it("dashboardScreen_statsLoaded_showsTheFiguresAndTheConsistencyNote", async () => {
    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.getByText("Updated in a few seconds.")).toBeInTheDocument();
  });

  it("dashboardScreen_statsNotFound_announcesTheProfileIsBeingPrepared", async () => {
    routeTo({ stats: jsonResponse({ title: "Profile.NotFound" }, 404) });

    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(
      await screen.findByText("Preparing your profile…"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("dashboardScreen_failingStats_doNotHideTheAscents", async () => {
    routeTo({ stats: jsonResponse({ title: "Boom" }, 500) });

    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(await screen.findByText("Latest ascents")).toBeInTheDocument();
    expect(
      await screen.findByRole("alert", {}, { timeout: 10_000 }),
    ).toBeInTheDocument();
  }, 15_000);

  it("dashboardScreen_noAscents_offersTheFirstSummit", async () => {
    routeTo({ ascents: jsonResponse(recent([])) });

    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(
      await screen.findByText("You haven't logged a summit yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Log your first summit" }),
    ).toHaveAttribute("href", "/dashboard/ascents/new");
  });

  it("dashboardScreen_withAscents_linksEachOneToItsDetail", async () => {
    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(
      await screen.findByRole("link", { name: /Aneto/ }),
    ).toHaveAttribute("href", "/dashboard/ascents/a-1");
    expect(screen.getByRole("link", { name: "See them all" })).toHaveAttribute(
      "href",
      "/dashboard/ascents",
    );
  });

  it("dashboardScreen_confirmedEmail_hidesTheBanner", async () => {
    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    await screen.findByText("Latest ascents");

    expect(
      screen.queryByText(
        "Confirm your email address to start logging ascents.",
      ),
    ).toBeNull();
  });

  it("dashboardScreen_unconfirmedEmail_showsTheBannerAsStatus", async () => {
    useEmailConfirmation.setState({ unconfirmed: true });

    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    expect(
      await screen.findByText(
        "Confirm your email address to start logging ascents.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("dashboardScreen_always_offersTheShortcutToLogASummit", async () => {
    renderWithProviders(<DashboardScreen />, { route: "/dashboard" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(
      screen.getByRole("link", { name: "Log a summit" }),
    ).toHaveAttribute("href", "/dashboard/ascents/new");
  });
});
