import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import {
  cancelLeave,
  confirmLeave,
  getPendingLeave,
  markUnsavedChanges,
  requestLeave,
  useUnsavedChanges,
} from "./unsavedChanges";

const Probe = ({ dirty }: { dirty: boolean }) => {
  useUnsavedChanges(dirty);

  return null;
};

afterEach(() => {
  markUnsavedChanges(false);
  cancelLeave();
  vi.clearAllMocks();
});

describe("requestLeave", () => {
  it("requestLeave_withNothingToLose_leavesImmediately", () => {
    const leave = vi.fn();

    requestLeave(leave);

    expect(leave).toHaveBeenCalledOnce();
    expect(getPendingLeave()).toBeUndefined();
  });

  it("requestLeave_withUnsavedChanges_holdsTheActionBack", () => {
    const leave = vi.fn();
    markUnsavedChanges(true);

    requestLeave(leave);

    expect(leave).not.toHaveBeenCalled();
    expect(getPendingLeave()).toBeDefined();
  });

  it("confirmLeave_runsTheHeldActionExactlyOnce", () => {
    const leave = vi.fn();
    markUnsavedChanges(true);
    requestLeave(leave);

    confirmLeave();

    expect(leave).toHaveBeenCalledOnce();
    expect(getPendingLeave()).toBeUndefined();
  });

  it("cancelLeave_dropsTheActionAndKeepsTheForm", () => {
    const leave = vi.fn();
    markUnsavedChanges(true);
    requestLeave(leave);

    cancelLeave();

    expect(leave).not.toHaveBeenCalled();
    expect(getPendingLeave()).toBeUndefined();
  });

  it("confirmLeave_clearsTheFlagSoTheNextBackPressJustLeaves", () => {
    markUnsavedChanges(true);
    requestLeave(vi.fn());
    confirmLeave();
    const second = vi.fn();

    requestLeave(second);

    expect(second).toHaveBeenCalledOnce();
  });
});

describe("useUnsavedChanges", () => {
  it("useUnsavedChanges_whileDirty_holdsLeavingBack", () => {
    render(<Probe dirty />);
    const leave = vi.fn();

    requestLeave(leave);

    expect(leave).not.toHaveBeenCalled();
  });

  it("useUnsavedChanges_unmount_stopsGuardingTheNextScreen", () => {
    const { unmount } = render(<Probe dirty />);

    unmount();
    const leave = vi.fn();
    requestLeave(leave);

    expect(leave).toHaveBeenCalledOnce();
  });

  it("useUnsavedChanges_afterSubmitting_stopsGuarding", () => {
    const { rerender } = render(<Probe dirty />);

    rerender(<Probe dirty={false} />);
    const leave = vi.fn();
    requestLeave(leave);

    expect(leave).toHaveBeenCalledOnce();
  });
});

describe("UnsavedChangesDialog", () => {
  const mountDialog = () =>
    render(
      <IntlWrapper>
        <UnsavedChangesDialog />
      </IntlWrapper>,
    );

  it("dialog_withNoPendingLeave_staysClosed", () => {
    mountDialog();

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("dialog_whenLeavingIsHeld_asksBeforeDiscarding", async () => {
    markUnsavedChanges(true);
    const leave = vi.fn();
    mountDialog();

    requestLeave(leave);

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
  });

  it("dialog_discard_runsTheHeldNavigation", async () => {
    markUnsavedChanges(true);
    const leave = vi.fn();
    mountDialog();
    requestLeave(leave);

    await userEvent.click(await screen.findByRole("button", { name: "Discard changes" }));

    expect(leave).toHaveBeenCalledOnce();
  });

  it("dialog_cancel_keepsTheUserOnTheForm", async () => {
    markUnsavedChanges(true);
    const leave = vi.fn();
    mountDialog();
    requestLeave(leave);

    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(leave).not.toHaveBeenCalled();
  });
});
