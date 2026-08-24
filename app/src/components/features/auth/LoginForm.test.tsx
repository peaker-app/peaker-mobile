import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { IntlWrapper } from "@/test/IntlWrapper";

const replace = vi.fn();
const refresh = vi.fn();
const signInMock = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/auth/session", () => ({
  signIn: (credentials: unknown) => signInMock(credentials),
}));

const { LoginForm } = await import("./LoginForm");
const { useEmailConfirmation } = await import("@/stores/emailConfirmation");

const respondWith = (status: number, body: Record<string, unknown> = {}) =>
  signInMock.mockRejectedValue(new ApiError({ status, ...body }));

const accept = () => signInMock.mockResolvedValue(undefined);

const signIn = async (identifier = "ruben", password = "secret1234") => {
  await userEvent.type(screen.getByLabelText("Email or username"), identifier);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("LoginForm", () => {
  it("loginForm_singleIdentifierField_coversEmailAndUsername", () => {
    render(<LoginForm />, { wrapper: IntlWrapper });

    expect(screen.getByLabelText("Email or username")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email address")).toBeNull();
  });

  it("loginForm_identifierField_isLeftToRightEvenInArabic", () => {
    render(<LoginForm />, {
      wrapper: ({ children }) => (
        <IntlWrapper locale="ar">{children}</IntlWrapper>
      ),
    });

    expect(
      screen.getByLabelText("البريد الإلكتروني أو اسم المستخدم"),
    ).toHaveAttribute("dir", "ltr");
  });

  it("loginForm_validCredentials_sendsTheIdentifierUntouched", async () => {
    accept();
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn("  Ruben@Correo.ES  ");

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith({
        identifier: "  Ruben@Correo.ES  ",
        password: "secret1234",
      }),
    );
  });

  it("loginForm_success_navigatesToTheDashboardByDefault", async () => {
    accept();
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("loginForm_success_dropsTheUnconfirmedMarkOfWhoeverUsedTheAppBefore", async () => {
    useEmailConfirmation.setState({ unconfirmed: true });
    accept();
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() =>
      expect(useEmailConfirmation.getState().unconfirmed).toBe(false),
    );
  });

  it("loginForm_rejectedCredentials_leavesTheUnconfirmedMarkAlone", async () => {
    useEmailConfirmation.setState({ unconfirmed: true });
    respondWith(401, { title: "User.InvalidCredentials" });
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(useEmailConfirmation.getState().unconfirmed).toBe(true);
  });

  it("loginForm_successWithSafeNext_honoursTheDestination", async () => {
    accept();
    render(<LoginForm next="/en/dashboard/ascents" />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/dashboard/ascents"),
    );
  });

  it("loginForm_rejectedCredentials_showsOneGenericMessage", async () => {
    respondWith(401, { title: "User.InvalidCredentials" });
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Those credentials aren't valid.",
      ),
    );
  });

  it("loginForm_rejectedCredentials_neverBlamesAField", async () => {
    respondWith(401, { title: "User.InvalidCredentials" });
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByLabelText("Email or username")).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Password")).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("loginForm_rejectedCredentials_returnsFocusToTheIdentifier", async () => {
    respondWith(401, { title: "User.InvalidCredentials" });
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() =>
      expect(screen.getByLabelText("Email or username")).toHaveFocus(),
    );
  });

  it("loginForm_rateLimited_disablesTheButton", async () => {
    respondWith(429);
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled(),
    );
  });

  it("loginForm_serverError_showsTheStatusFallback", async () => {
    respondWith(503, {});
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Service temporarily unavailable.",
      ),
    );
  });

  it("loginForm_networkFailure_showsTheGenericMessage", async () => {
    signInMock.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<LoginForm />, { wrapper: IntlWrapper });

    await signIn();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Please try again.",
      ),
    );
  });
});
