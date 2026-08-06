import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const restoreSession = vi.fn();

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

vi.mock("@capacitor/device", () => ({
  Device: { getLanguageCode: () => Promise.resolve({ value: "en" }) },
}));

vi.mock("@/lib/auth/refresh", () => ({
  refreshSession: () => restoreSession(),
}));

vi.mock("@/components/features/peaks/PeakMap", () => ({
  PeakMap: () => null,
}));

const { App } = await import("./App");

const goTo = (path: string) => {
  window.history.pushState({}, "", path);
};

beforeEach(() => {
  restoreSession.mockResolvedValue(undefined);
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        items: [],
        page: 1,
        size: 24,
        totalCount: 0,
        totalPages: 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  goTo("/");
});

describe("App", () => {
  it("app_root_landsOnThePeaksCatalogue", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Peaks" }),
    ).toBeInTheDocument();
  });

  it("app_render_showsTheTabBar", async () => {
    render(<App />);

    expect(
      await screen.findByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
  });

  it("app_unknownRoute_showsTheNotFoundScreen", async () => {
    goTo("/does-not-exist");

    render(<App />);

    expect(await screen.findByText("404")).toBeInTheDocument();
  });

  it("app_privateRouteWithoutSession_divertsToLogin", async () => {
    goTo("/dashboard/collections");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
  });

  it("app_publicRoute_doesNotRequireASession", async () => {
    goTo("/peaks/nearby");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Peaks near you" }),
    ).toBeInTheDocument();
  });

  it("app_nearbyRoute_neverFallsIntoThePeakDetail", async () => {
    goTo("/peaks/nearby");

    render(<App />);

    await screen.findByRole("heading", { name: "Peaks near you" });

    expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
  });

  it("app_peakDetailRoute_rendersTheFicheForThatIdentifier", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          name: "Aneto",
          altitudeMeters: 3404,
          prominenceMeters: null,
          latitude: 42.63,
          longitude: 0.65,
          countryCode: "ES",
          region: null,
          imageUrl: null,
          rangeId: null,
          rangeName: null,
          alternativeNames: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    goTo("/peaks/11111111-1111-1111-1111-111111111111");

    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Aneto" }),
    ).toBeInTheDocument();
  });

  it("app_loginRoute_rendersTheFormOutsideTheTabShell", async () => {
    goTo("/login");

    render(<App />);

    expect(
      await screen.findByLabelText("Email or username"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Main navigation" }),
    ).not.toBeInTheDocument();
  });

  it("app_loginRouteAfterRegistering_announcesTheNewAccount", async () => {
    goTo("/login?registered=1");

    render(<App />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Account created",
    );
  });

  it("app_registerRoute_rendersTheSignUpForm", async () => {
    goTo("/register");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Create your account" }),
    ).toBeInTheDocument();
  });

  it("app_confirmEmailWithoutToken_offersTheManualForm", async () => {
    goTo("/confirm-email");

    render(<App />);

    expect(
      await screen.findByLabelText("Confirmation link or token"),
    ).toBeInTheDocument();
  });

  it("app_resendRouteWithoutSession_divertsToLogin", async () => {
    goTo("/confirm-email/pending");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
  });
});
