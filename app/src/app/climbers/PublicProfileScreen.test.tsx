import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { IntlProvider } from "use-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { jsonResponse } from "@/test/authHarness";
import type {
  AscentSummaryResponse,
  PagedResponse,
  PublicProfileResponse,
} from "@/types/api";

const { PublicProfileScreen } = await import("./PublicProfileScreen");

const profile: PublicProfileResponse = {
  userId: "u-1",
  displayName: "Ana",
  slug: "ana",
  bio: "Pirineos y poco más.",
  avatarUrl: null,
  countryCode: "ES",
  stats: {
    totalAscents: 7,
    distinctPeaks: 5,
    highestAltitudeMeters: 3404,
    highestPeakId: "peak-1",
    highestPeakName: "Aneto",
    lastAscentDate: "2026-07-20",
  },
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

const paged = (
  items: AscentSummaryResponse[],
): PagedResponse<AscentSummaryResponse> => ({
  items,
  page: 1,
  size: 10,
  totalCount: items.length,
  totalPages: 1,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

const routeTo = (responses: { profile?: Response; ascents?: Response } = {}) => {
  fetchMock.mockImplementation((input) => {
    const url = String(input);

    if (url.includes("/profiles/by-slug/")) {
      return Promise.resolve((responses.profile ?? jsonResponse(profile)).clone());
    }

    return Promise.resolve((responses.ascents ?? jsonResponse(paged([ascent]))).clone());
  });
};

const renderScreen = (route = "/climbers/ana") => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider
      locale={defaultLocale}
      messages={messages[defaultLocale]}
      timeZone="UTC"
    >
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>
  );

  return render(
    <Routes>
      <Route path="/climbers/:slug" element={<PublicProfileScreen />} />
    </Routes>,
    { wrapper: Wrapper },
  );
};

beforeEach(() => {
  routeTo();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PublicProfileScreen", () => {
  it("publicProfileScreen_loaded_looksUpBySlugNotByUserId", async () => {
    renderScreen();

    await screen.findByRole("heading", { level: 1, name: "Ana" });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/profiles/by-slug/ana",
    );
  });

  it("publicProfileScreen_labelsTheStatsAsPublicOnly", async () => {
    renderScreen();

    expect(
      await screen.findByText("Public ascents only"),
    ).toBeInTheDocument();
  });

  it("publicProfileScreen_ascents_areFetchedByTheUserIdTheProfileReturned", async () => {
    renderScreen();

    await screen.findByRole("link", { name: /Aneto/ });

    const ascentCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes("/ascents/by-user/"),
    );

    expect(String(ascentCall?.[0])).toContain("/ascents/by-user/u-1");
  });

  it("publicProfileScreen_ascentCards_pointAtThePublicRouteNotTheOwnerOne", async () => {
    renderScreen();

    expect(await screen.findByRole("link", { name: /Aneto/ })).toHaveAttribute(
      "href",
      "/ascents/a-1",
    );
  });

  it("publicProfileScreen_privateOrMissing_showsNotFoundAndNeverA403", async () => {
    routeTo({ profile: jsonResponse({ title: "Profile.NotFound" }, 404) });

    renderScreen();

    expect(await screen.findByText("404")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("publicProfileScreen_noPublicAscents_isEmptyNotAnError", async () => {
    routeTo({ ascents: jsonResponse(paged([])) });

    renderScreen();

    expect(
      await screen.findByText("This climber has no public ascents yet."),
    ).toBeInTheDocument();
  });

  it("publicProfileScreen_failingAscents_doNotHideTheProfile", async () => {
    routeTo({ ascents: jsonResponse({ title: "Boom" }, 503) });

    renderScreen();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Ana" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("alert", {}, { timeout: 10_000 }),
    ).toBeInTheDocument();
  }, 15_000);
});
