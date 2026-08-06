import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionState } from "@/lib/auth/sessionStore";
import { renderWithProviders } from "@/test/renderWithProviders";

const sessionState = vi.fn<() => SessionState>();

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => sessionState(),
}));

const { RequireAnonymous } = await import("./RequireAnonymous");

const DestinationProbe = () => (
  <p data-testid="destination">{useLocation().pathname}</p>
);

const renderGuard = (route: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<RequireAnonymous />}>
        <Route path="/login" element={<p>sign in form</p>} />
      </Route>
      <Route path="/dashboard" element={<DestinationProbe />} />
      <Route path="/dashboard/collections" element={<DestinationProbe />} />
    </Routes>,
    { route },
  );

const authenticated: SessionState = {
  status: "authenticated",
  session: { userId: "u-1", email: "ana@peaker.app" },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("RequireAnonymous", () => {
  it("requireAnonymous_stillRestoring_showsALoadingHint", () => {
    sessionState.mockReturnValue({ status: "unknown", session: undefined });

    renderGuard("/login");

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("requireAnonymous_anonymous_rendersTheRoute", () => {
    sessionState.mockReturnValue({ status: "anonymous", session: undefined });

    renderGuard("/login");

    expect(screen.getByText("sign in form")).toBeInTheDocument();
  });

  it("requireAnonymous_authenticated_divertsToTheDashboard", () => {
    sessionState.mockReturnValue(authenticated);

    renderGuard("/login");

    expect(screen.getByTestId("destination")).toHaveTextContent("/dashboard");
  });

  it("requireAnonymous_authenticatedWithSafeNext_honoursTheDestination", () => {
    sessionState.mockReturnValue(authenticated);

    renderGuard("/login?next=%2Fdashboard%2Fcollections");

    expect(screen.getByTestId("destination")).toHaveTextContent(
      "/dashboard/collections",
    );
  });

  it("requireAnonymous_authenticatedWithAbsoluteNext_refusesTheOpenRedirect", () => {
    sessionState.mockReturnValue(authenticated);

    renderGuard("/login?next=https%3A%2F%2Fevil.example");

    expect(screen.getByTestId("destination")).toHaveTextContent("/dashboard");
  });
});
