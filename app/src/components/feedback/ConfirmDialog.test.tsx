import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { ConfirmDialog } from "./ConfirmDialog";

const props = {
  open: true,
  onOpenChange: () => undefined,
  title: "Delete ascent",
  description: "This removes the ascent and its 3 photos.",
  confirmLabel: "Delete ascent",
};

describe("ConfirmDialog", () => {
  it("confirmDialog_open_usesTheAlertdialogRole", () => {
    render(<ConfirmDialog {...props} onConfirm={() => undefined} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("confirmDialog_open_enumeratesWhatIsLost", () => {
    render(<ConfirmDialog {...props} onConfirm={() => undefined} />, {
      wrapper: IntlWrapper,
    });

    expect(
      screen.getByText("This removes the ascent and its 3 photos."),
    ).toBeInTheDocument();
  });

  it("confirmDialog_destructiveButton_isLabelledWithTheVerb", () => {
    render(<ConfirmDialog {...props} onConfirm={() => undefined} />, {
      wrapper: IntlWrapper,
    });

    expect(
      screen.getByRole("button", { name: "Delete ascent" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm" })).toBeNull();
  });

  it("confirmDialog_confirmClicked_callsTheHandler", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...props} onConfirm={onConfirm} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Delete ascent" }),
    );

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("confirmDialog_confirmDisabled_marksItWithAriaDisabled", () => {
    render(
      <ConfirmDialog {...props} confirmDisabled onConfirm={() => undefined} />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByRole("button", { name: "Delete ascent" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("confirmDialog_closed_rendersNothing", () => {
    render(
      <ConfirmDialog {...props} open={false} onConfirm={() => undefined} />,
      { wrapper: IntlWrapper },
    );

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
