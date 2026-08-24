import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { PasswordField } from "./PasswordField";

const toggle = () => screen.getByRole("button");

describe("PasswordField", () => {
  it("passwordField_byDefault_hidesTheValue", () => {
    renderWithProviders(<PasswordField aria-label="Password" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(toggle()).toHaveAttribute("aria-label", "Show password");
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
  });

  it("passwordField_toggled_revealsTheValue", async () => {
    renderWithProviders(<PasswordField aria-label="Password" />);

    await userEvent.click(toggle());

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(toggle()).toHaveAttribute("aria-label", "Hide password");
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
  });

  it("passwordField_toggledTwice_hidesTheValueAgain", async () => {
    renderWithProviders(<PasswordField aria-label="Password" />);

    await userEvent.click(toggle());
    await userEvent.click(toggle());

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });
});
