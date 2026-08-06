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

const { App } = await import("./App");

const goTo = (path: string) => {
  window.history.pushState({}, "", path);
};

beforeEach(() => {
  restoreSession.mockResolvedValue(undefined);
});

afterEach(() => {
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
      await screen.findByRole("heading", { name: "Nearby" }),
    ).toBeInTheDocument();
  });
});
