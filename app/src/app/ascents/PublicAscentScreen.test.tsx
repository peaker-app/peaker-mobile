import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, jwt } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { AscentResponse, PublicProfileResponse } from "@/types/api";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return { ...actual, useParams: () => ({ id: "a-1" }) };
});

const { PublicAscentScreen } = await import("./PublicAscentScreen");
const { markAnonymous, markAuthenticated } = await import(
  "@/lib/auth/sessionStore"
);

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

const author: PublicProfileResponse = {
  userId: "u-1",
  displayName: "Ana",
  slug: "ana",
  bio: null,
  avatarUrl: null,
  countryCode: "ES",
  stats: {
    totalAscents: 1,
    distinctPeaks: 1,
    highestAltitudeMeters: 3404,
    highestPeakId: null,
    highestPeakName: null,
    lastAscentDate: null,
  },
};

const fetchMock = vi.spyOn(globalThis, "fetch");

const routeTo = (responses: Partial<{ ascent: Response; author: Response }>) => {
  fetchMock.mockImplementation((input) =>
    String(input).includes("/profiles/")
      ? Promise.resolve(responses.author ?? jsonResponse(author))
      : Promise.resolve(responses.ascent ?? jsonResponse(ascent())),
  );
};

beforeEach(() => {
  markAnonymous();
  routeTo({});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PublicAscentScreen", () => {
  it("publicAscentScreen_loaded_showsThePeakTheAltitudeAndTheDate", async () => {
    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Aneto" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3,404 m/)).toBeInTheDocument();
    expect(screen.getByText(/Climbed on/)).toBeInTheDocument();
  });

  it("publicAscentScreen_loaded_readsTheAscentOnce", async () => {
    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    await screen.findByRole("heading", { level: 1, name: "Aneto" });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter((call) =>
          String(call[0]).endsWith("/api/ascents/a-1"),
        ),
      ).toHaveLength(1),
    );
  });

  it("publicAscentScreen_loaded_showsNotesCompanionsAndConditions", async () => {
    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(await screen.findByText("Vía normal")).toBeInTheDocument();
    expect(screen.getByText("Ana, Luis")).toBeInTheDocument();
    expect(screen.getByText("Conditions")).toBeInTheDocument();
  });

  it("publicAscentScreen_emptyAscent_showsOnlyThePeakAndTheDate", async () => {
    routeTo({
      ascent: jsonResponse(
        ascent({
          companions: null,
          routeNotes: null,
          conditions: { snow: null, wind: null, trail: null },
        }),
      ),
    });

    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    await screen.findByRole("heading", { level: 1, name: "Aneto" });
    expect(screen.queryByText("Route notes")).toBeNull();
    expect(screen.queryByText("Conditions")).toBeNull();
  });

  it("publicAscentScreen_knownAuthor_linksToTheirPublicProfile", async () => {
    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(
      await screen.findByRole("link", { name: "Logged by Ana" }),
    ).toHaveAttribute("href", "/climbers/ana");
  });

  it("publicAscentScreen_privateAuthorProfile_stillShowsTheAscent", async () => {
    routeTo({ author: jsonResponse({ title: "Profile.NotFound" }, 404) });

    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Aneto" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Logged by/ })).toBeNull();
  });

  it("publicAscentScreen_always_linksToThePeak", async () => {
    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(
      await screen.findByRole("link", { name: "See this peak" }),
    ).toHaveAttribute("href", "/peaks/peak-1");
  });

  it("publicAscentScreen_visitor_getsNoEditAction", async () => {
    markAuthenticated(jwt({ sub: "someone-else", email: "other@peaker.app" }));

    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    await screen.findByRole("heading", { level: 1, name: "Aneto" });
    expect(screen.queryByRole("link", { name: "Edit" })).toBeNull();
  });

  it("publicAscentScreen_owner_getsTheEditAction", async () => {
    markAuthenticated(jwt({ sub: "u-1", email: "ana@peaker.app" }));

    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(await screen.findByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/dashboard/ascents/a-1/edit",
    );
  });

  it("publicAscentScreen_notFound_showsTheNotFoundScreen", async () => {
    routeTo({ ascent: jsonResponse({ title: "Ascent.NotFound" }, 404) });

    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(await screen.findByText("404")).toBeInTheDocument();
  });

  it("publicAscentScreen_hiddenBehindAPrivateProfile_isAlsoANotFound", async () => {
    routeTo({
      ascent: jsonResponse({ title: "Ascent.ProfileNotVisible" }, 404),
    });

    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(await screen.findByText("404")).toBeInTheDocument();
  });

  it("publicAscentScreen_profileDirectoryUnavailable_isAnErrorWithRetryNotA404", async () => {
    routeTo({
      ascent: jsonResponse({ title: "Ascent.ProfileDirectoryUnavailable" }, 503),
    });

    renderWithProviders(<PublicAscentScreen />, { route: "/ascents/a-1" });

    expect(
      await screen.findByRole("alert", {}, { timeout: 10_000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText("404")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  }, 15_000);
});
