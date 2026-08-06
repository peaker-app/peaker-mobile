import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("errorState_anyMessage_rendersAsAlert", () => {
    render(<ErrorState message="Service temporarily unavailable." />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Service temporarily unavailable."),
    ).toBeInTheDocument();
  });

  it("errorState_withoutRetryHandler_hidesRetryButton", () => {
    render(<ErrorState message="Not found." />, { wrapper: IntlWrapper });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("errorState_retryClicked_callsHandler", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Server error." onRetry={onRetry} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
