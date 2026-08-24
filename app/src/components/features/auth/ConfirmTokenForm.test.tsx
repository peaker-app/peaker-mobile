import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ConfirmTokenForm } from "./ConfirmTokenForm";

const token = "0hEO-3nQrVQwWZ0mQ0oNqA";

const paste = async (value: string) => {
  await userEvent.type(
    screen.getByLabelText("Confirmation link or token"),
    value,
  );
  await userEvent.click(screen.getByRole("button", { name: "Confirm my email" }));
};

describe("ConfirmTokenForm", () => {
  it("confirmTokenForm_pastedLink_handsTheTokenToTheParent", async () => {
    const onToken = vi.fn();
    renderWithProviders(<ConfirmTokenForm onToken={onToken} />);

    await paste(`http://localhost:3000/confirm-email?token=${token}`);

    expect(onToken).toHaveBeenCalledWith(token);
  });

  it("confirmTokenForm_pastedBareToken_handsItOverToo", async () => {
    const onToken = vi.fn();
    renderWithProviders(<ConfirmTokenForm onToken={onToken} />);

    await paste(token);

    expect(onToken).toHaveBeenCalledWith(token);
  });

  it("confirmTokenForm_field_isLeftToRightEvenInArabic", () => {
    renderWithProviders(<ConfirmTokenForm onToken={vi.fn()} />, {
      locale: "ar",
    });

    expect(screen.getByLabelText("رابط التأكيد أو الرمز")).toHaveAttribute(
      "dir",
      "ltr",
    );
  });

  it("confirmTokenForm_emptySubmission_doesNotCallTheParent", async () => {
    const onToken = vi.fn();
    renderWithProviders(<ConfirmTokenForm onToken={onToken} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Confirm my email" }),
    );

    expect(onToken).not.toHaveBeenCalled();
  });
});
