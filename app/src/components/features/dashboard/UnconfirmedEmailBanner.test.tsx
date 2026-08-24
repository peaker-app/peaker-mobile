import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const { UnconfirmedEmailBanner } = await import("./UnconfirmedEmailBanner");
const { useEmailConfirmation } = await import("@/stores/emailConfirmation");

afterEach(() => {
  useEmailConfirmation.setState({ unconfirmed: false });
});

describe("UnconfirmedEmailBanner", () => {
  it("unconfirmedEmailBanner_confirmedAccount_rendersNothing", () => {
    render(<UnconfirmedEmailBanner />, { wrapper: IntlWrapper });

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("unconfirmedEmailBanner_unconfirmedAccount_informsWithoutInterrupting", () => {
    useEmailConfirmation.getState().markUnconfirmed();

    render(<UnconfirmedEmailBanner />, { wrapper: IntlWrapper });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Confirm your email address to start logging ascents.",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("unconfirmedEmailBanner_unconfirmedAccount_offersTheResendScreen", () => {
    useEmailConfirmation.getState().markUnconfirmed();

    render(<UnconfirmedEmailBanner />, { wrapper: IntlWrapper });

    expect(
      screen.getByRole("link", { name: "Send me the link again" }),
    ).toHaveAttribute("href", "/confirm-email/pending");
  });

  it("unconfirmedEmailBanner_clearedFlag_hidesTheBannerAgain", () => {
    useEmailConfirmation.getState().markUnconfirmed();
    const { rerender } = render(<UnconfirmedEmailBanner />, {
      wrapper: IntlWrapper,
    });

    useEmailConfirmation.getState().clear();
    rerender(<UnconfirmedEmailBanner />);

    expect(screen.queryByRole("status")).toBeNull();
  });
});
