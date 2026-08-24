import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionState } from "@/lib/auth/sessionStore";
import { renderWithProviders } from "@/test/renderWithProviders";

const sessionState = vi.fn<() => SessionState>();

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => sessionState(),
}));

const { RequireSession } = await import("./RequireSession");

const LoginProbe = () => <p data-testid="login">{useLocation().search}</p>;

const renderGuard = (route: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<RequireSession />}>
        <Route path="/dashboard/ascents" element={<p>private area</p>} />
      </Route>
      <Route path="/login" element={<LoginProbe />} />
    </Routes>,
    { route },
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe("RequireSession", () => {
  it("requireSession_stillRestoring_showsALoadingHint", () => {
    sessionState.mockReturnValue({ status: "unknown", session: undefined });

    renderGuard("/dashboard/ascents");

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("requireSession_authenticated_rendersTheRoute", () => {
    sessionState.mockReturnValue({
      status: "authenticated",
      session: { userId: "u-1", email: "ana@peaker.app" },
    });

    renderGuard("/dashboard/ascents");

    expect(screen.getByText("private area")).toBeInTheDocument();
  });

  it("requireSession_anonymous_divertsToLogin", () => {
    sessionState.mockReturnValue({ status: "anonymous", session: undefined });

    renderGuard("/dashboard/ascents");

    expect(screen.getByTestId("login")).toHaveTextContent(
      "next=%2Fdashboard%2Fascents",
    );
  });

  it("requireSession_anonymous_remembersTheQueryStringToo", () => {
    sessionState.mockReturnValue({ status: "anonymous", session: undefined });

    renderGuard("/dashboard/ascents?page=2");

    expect(screen.getByTestId("login")).toHaveTextContent(
      "next=%2Fdashboard%2Fascents%3Fpage%3D2",
    );
  });
});
