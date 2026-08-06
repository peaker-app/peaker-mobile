import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ResendConfirmationScreen } from "./ResendConfirmationScreen";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ResendConfirmationScreen", () => {
  it("resendConfirmationScreen_render_mountsTheResendCard", () => {
    renderWithProviders(<ResendConfirmationScreen />);

    expect(
      screen.getByRole("button", { name: "Resend link" }),
    ).toBeInTheDocument();
  });

  it("resendConfirmationScreen_render_offersTheWayBackToTheTokenForm", () => {
    renderWithProviders(<ResendConfirmationScreen />);

    expect(
      screen.getByRole("link", { name: "I already have the link: enter it" }),
    ).toHaveAttribute("href", "/confirm-email");
  });
});
