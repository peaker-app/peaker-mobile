import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const { ResendConfirmationCard } = await import("./ResendConfirmationCard");

const respondWith = (status: number, body: unknown = {}) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status < 400,
      status,
      json: async () => body,
    }),
  );

const press = () =>
  userEvent.click(screen.getByRole("button", { name: "Resend link" }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ResendConfirmationCard", () => {
  it("resend_render_warnsThatANewLinkInvalidatesTheOldOnes", () => {
    respondWith(204);
    render(<ResendConfirmationCard />, { wrapper: IntlWrapper });

    expect(
      screen.getByText(
        "Requesting a new link invalidates the previous ones: always use the most recent email.",
      ),
    ).toBeInTheDocument();
  });

  it("resend_success_confirmsAndStartsTheCooldown", async () => {
    respondWith(204);
    render(<ResendConfirmationCard />, { wrapper: IntlWrapper });

    await press();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Link sent. Check your inbox.",
      ),
    );
    expect(screen.getByRole("button", { name: "Resend link" })).toBeDisabled();
  });

  it("resend_cooldown_showsTheCountdownLeftToRight", async () => {
    respondWith(204);
    const { container } = render(<ResendConfirmationCard />, {
      wrapper: IntlWrapper,
    });

    await press();

    await waitFor(() =>
      expect(container.querySelector('[dir="ltr"]')).toHaveTextContent("2:00"),
    );
  });

  it("resend_cooldown_isNotAnnouncedEverySecond", async () => {
    respondWith(204);
    render(<ResendConfirmationCard />, { wrapper: IntlWrapper });

    await press();

    await waitFor(() =>
      expect(document.querySelector("#resend-cooldown")).toHaveAttribute(
        "aria-live",
        "off",
      ),
    );
  });

  it("resend_serverCooldown_alsoDisablesTheButtonOnA429", async () => {
    respondWith(429, { title: "EmailConfirmation.ResendTooSoon" });
    render(<ResendConfirmationCard />, { wrapper: IntlWrapper });

    await press();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "You asked for a link very recently.",
      ),
    );
    expect(screen.getByRole("button", { name: "Resend link" })).toBeDisabled();
  });

  it("resend_alreadyConfirmed_isSuccessWithANuance", async () => {
    respondWith(409, { title: "User.EmailAlreadyConfirmed" });
    render(<ResendConfirmationCard />, { wrapper: IntlWrapper });

    await press();

    await waitFor(() =>
      expect(
        screen.getByText("Your email is already confirmed."),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("resend_deliveryFailure_reportsItAndKeepsTheButtonUsable", async () => {
    respondWith(503, { title: "EmailConfirmation.DeliveryFailed" });
    render(<ResendConfirmationCard />, { wrapper: IntlWrapper });

    await press();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "We couldn't send the email. Try again in a moment.",
      ),
    );
    expect(screen.getByRole("button", { name: "Resend link" })).toBeEnabled();
  });
});
