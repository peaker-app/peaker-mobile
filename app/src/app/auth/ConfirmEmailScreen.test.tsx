import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionState } from "@/lib/auth/sessionStore";
import { renderWithProviders } from "@/test/renderWithProviders";

const anonymous: SessionState = { status: "anonymous", session: undefined };

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => anonymous,
}));

const { ConfirmEmailScreen } = await import("./ConfirmEmailScreen");

const token = "0hEO-3nQrVQwWZ0mQ0oNqA";

const stubFetch = () => {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(url);

      return { ok: true, status: 204, json: async () => ({}) };
    }),
  );

  return { confirmCalls: () => calls.filter((u) => u.includes("email/confirm")) };
};

const pasteField = () => screen.getByLabelText("Confirmation link or token");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ConfirmEmailScreen", () => {
  it("confirmEmailScreen_withoutToken_offersTheManualForm", async () => {
    const { confirmCalls } = stubFetch();
    renderWithProviders(<ConfirmEmailScreen />, { route: "/confirm-email" });

    await waitFor(() => expect(pasteField()).toBeInTheDocument());
    expect(confirmCalls()).toHaveLength(0);
  });

  it("confirmEmailScreen_tokenInTheUrl_confirmsWithoutTheManualForm", async () => {
    const { confirmCalls } = stubFetch();
    renderWithProviders(<ConfirmEmailScreen />, {
      route: `/confirm-email?token=${token}`,
    });

    await waitFor(() =>
      expect(screen.getByText("Your email is confirmed")).toBeInTheDocument(),
    );
    expect(
      screen.queryByLabelText("Confirmation link or token"),
    ).not.toBeInTheDocument();
    expect(confirmCalls()).toHaveLength(1);
  });

  it("confirmEmailScreen_pastedLink_confirmsAndHidesTheManualForm", async () => {
    const { confirmCalls } = stubFetch();
    renderWithProviders(<ConfirmEmailScreen />, { route: "/confirm-email" });

    await userEvent.type(
      pasteField(),
      `http://localhost:3000/confirm-email?token=${token}`,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm my email" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Your email is confirmed")).toBeInTheDocument(),
    );
    expect(
      screen.queryByLabelText("Confirmation link or token"),
    ).not.toBeInTheDocument();
    expect(confirmCalls()).toHaveLength(1);
  });
});
