import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SessionState } from "@/lib/auth/sessionStore";
import { renderWithProviders } from "@/test/renderWithProviders";

const authenticated: SessionState = {
  status: "authenticated",
  session: { userId: "u-1", email: "ana@peaker.app" },
};

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => authenticated,
  signOut: () => Promise.resolve(),
}));

const { AccountScreen } = await import("./AccountScreen");

describe("AccountScreen", () => {
  it("accountScreen_authenticated_showsTheAddressLeftToRight", () => {
    renderWithProviders(<AccountScreen />);

    expect(screen.getByText("ana@peaker.app")).toHaveAttribute("dir", "ltr");
  });

  it("accountScreen_emailCard_linksToTheResendScreen", () => {
    renderWithProviders(<AccountScreen />);

    expect(
      screen.getByRole("link", { name: "Send me the confirmation link" }),
    ).toHaveAttribute("href", "/confirm-email/pending");
  });

  it("accountScreen_sessionCard_mountsTheSignOutButton", () => {
    renderWithProviders(<AccountScreen />);

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });
});
