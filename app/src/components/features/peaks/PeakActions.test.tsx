import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { SessionState } from "@/lib/auth/sessionStore";

const sessionState = vi.fn<() => SessionState>();

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => sessionState(),
}));

const { PeakActions } = await import("./PeakActions");

const peakId = "11111111-1111-1111-1111-111111111111";

const anonymous: SessionState = { status: "anonymous", session: undefined };
const authenticated: SessionState = {
  status: "authenticated",
  session: { userId: "u-1", email: "ana@peaker.app" },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PeakActions", () => {
  it("peakActions_unknownSession_showsAPlaceholderInsteadOfGuessing", () => {
    sessionState.mockReturnValue({ status: "unknown", session: undefined });

    renderWithProviders(<PeakActions peakId={peakId} locale="en" />);

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("peakActions_anonymous_sendsTheAscentToLoginCarryingTheReturnPath", () => {
    sessionState.mockReturnValue(anonymous);

    renderWithProviders(<PeakActions peakId={peakId} locale="en" />);

    expect(
      screen.getByRole("link", { name: "Log an ascent" }),
    ).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(`/en/dashboard/ascents/new?peakId=${peakId}`)}`,
    );
  });

  it("peakActions_anonymous_sendsTheCollectionToLoginBackToThePeak", () => {
    sessionState.mockReturnValue(anonymous);

    renderWithProviders(<PeakActions peakId={peakId} locale="es" />);

    expect(
      screen.getByRole("link", { name: "Add to a collection" }),
    ).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(`/es/peaks/${peakId}`)}`,
    );
  });

  it("peakActions_anonymous_explainsWhySigningInIsNeeded", () => {
    sessionState.mockReturnValue(anonymous);

    renderWithProviders(<PeakActions peakId={peakId} locale="en" />);

    expect(
      screen.getByText("You'll need an account to log an ascent."),
    ).toBeInTheDocument();
  });

  it("peakActions_authenticated_linksStraightToTheAscentForm", () => {
    sessionState.mockReturnValue(authenticated);

    renderWithProviders(<PeakActions peakId={peakId} locale="en" />);

    expect(screen.getByRole("link", { name: "Log an ascent" })).toHaveAttribute(
      "href",
      `/dashboard/ascents/new?peakId=${peakId}`,
    );
  });

  it("peakActions_authenticated_opensTheCollectionPickerInsteadOfLogin", () => {
    sessionState.mockReturnValue(authenticated);

    renderWithProviders(<PeakActions peakId={peakId} locale="en" />);

    expect(
      screen.getByRole("button", { name: "Add to a collection" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Add to a collection" }),
    ).toBeNull();
  });
});
