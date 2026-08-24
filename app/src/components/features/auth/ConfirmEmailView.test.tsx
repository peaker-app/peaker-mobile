import { screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionState } from "@/lib/auth/sessionStore";
import { renderWithProviders } from "@/test/renderWithProviders";

const anonymous: SessionState = { status: "anonymous", session: undefined };
const sessionState = vi.fn<() => SessionState>(() => anonymous);

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => sessionState(),
}));

const { ConfirmEmailView } = await import("./ConfirmEmailView");
const { useEmailConfirmation } = await import("@/stores/emailConfirmation");

const confirmResponse = (status: number, body: unknown = {}) => ({
  ok: status < 400,
  status,
  json: async () => body,
});

const stubFetch = (confirm: ReturnType<typeof confirmResponse>) => {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (url: string) => {
    calls.push(url);

    return confirm;
  });
  vi.stubGlobal("fetch", fetchMock);

  return {
    confirmCalls: () => calls.filter((url) => url.includes("email/confirm")),
  };
};

beforeEach(() => {
  useEmailConfirmation.setState({ unconfirmed: true });
});

afterEach(() => {
  vi.restoreAllMocks();
  sessionState.mockReturnValue(anonymous);
});

describe("ConfirmEmailView", () => {
  it("confirmEmailView_withToken_confirmsAndReportsSuccess", async () => {
    stubFetch(confirmResponse(204));
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(screen.getByText("Your email is confirmed")).toBeInTheDocument(),
    );
  });

  it("confirmEmailView_underStrictMode_callsTheOneShotEndpointOnlyOnce", async () => {
    const { confirmCalls } = stubFetch(confirmResponse(204));

    renderWithProviders(
      <StrictMode>
        <ConfirmEmailView token="abc123" />
      </StrictMode>,
    );

    await waitFor(() =>
      expect(screen.getByText("Your email is confirmed")).toBeInTheDocument(),
    );
    expect(confirmCalls()).toHaveLength(1);
  });

  it("confirmEmailView_alreadyConfirmed_isTreatedAsSuccessNotFailure", async () => {
    stubFetch(confirmResponse(409, { title: "User.EmailAlreadyConfirmed" }));
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(
        screen.getByText("Your email was already confirmed"),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText("We couldn't confirm your email")).toBeNull();
  });

  it("confirmEmailView_confirmed_takesTheDashboardBannerDown", async () => {
    stubFetch(confirmResponse(204));
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(useEmailConfirmation.getState().unconfirmed).toBe(false),
    );
  });

  it("confirmEmailView_alreadyConfirmed_takesTheDashboardBannerDown", async () => {
    stubFetch(confirmResponse(409, { title: "User.EmailAlreadyConfirmed" }));
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(useEmailConfirmation.getState().unconfirmed).toBe(false),
    );
  });

  it("confirmEmailView_expiredToken_keepsTheBannerBecauseNothingWasConfirmed", async () => {
    stubFetch(
      confirmResponse(400, { title: "EmailConfirmation.InvalidOrExpired" }),
    );
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(
        screen.getByText("We couldn't confirm your email"),
      ).toBeInTheDocument(),
    );
    expect(useEmailConfirmation.getState().unconfirmed).toBe(true);
  });

  it("confirmEmailView_expiredToken_offersToRequestANewLink", async () => {
    stubFetch(
      confirmResponse(400, { title: "EmailConfirmation.InvalidOrExpired" }),
    );
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "Request a new link" }),
      ).toHaveAttribute("href", "/confirm-email/pending"),
    );
  });

  it("confirmEmailView_withoutToken_failsWithoutCallingTheApi", async () => {
    const { confirmCalls } = stubFetch(confirmResponse(204));
    renderWithProviders(<ConfirmEmailView />);

    await waitFor(() =>
      expect(
        screen.getByText(
          "This link has no token. Open the most recent email we sent you.",
        ),
      ).toBeInTheDocument(),
    );
    expect(confirmCalls()).toHaveLength(0);
  });

  it("confirmEmailView_successWithoutSession_offersTheLogin", async () => {
    stubFetch(confirmResponse(204));
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
        "href",
        "/login",
      ),
    );
  });

  it("confirmEmailView_successWithSession_offersTheDashboard", async () => {
    sessionState.mockReturnValue({
      status: "authenticated",
      session: { userId: "u-1", email: "ana@peaker.app" },
    });
    stubFetch(confirmResponse(204));
    renderWithProviders(<ConfirmEmailView token="abc123" />);

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "Go to my activity" }),
      ).toHaveAttribute("href", "/dashboard"),
    );
  });

  it("confirmEmailView_stateChanges_areAnnouncedPolitely", () => {
    stubFetch(confirmResponse(204));
    const { container } = renderWithProviders(
      <ConfirmEmailView token="abc123" />,
    );

    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});
