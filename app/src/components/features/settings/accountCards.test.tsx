import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/en.json";
import { ApiError } from "@/lib/api/client";

const apiFetch = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
const setLocale = vi.fn();
const revokeSession = vi.fn().mockResolvedValue(undefined);
const revokeEverySession = vi.fn().mockResolvedValue(undefined);
const clearTokens = vi.fn().mockResolvedValue(undefined);

let sessionState = {
  status: "authenticated" as const,
  session: { userId: "u1", email: "ruben@correo.es" },
};

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
  usePathname: () => "/dashboard/settings/account",
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/i18n/LocaleProvider", () => ({
  useLocaleSetting: () => ({ locale: "en", setLocale }),
}));

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => sessionState,
  signOut: () => revokeSession(),
  signOutEverywhere: () => revokeEverySession(),
}));

vi.mock("@/lib/auth/tokenStore", () => ({
  clearTokens: () => clearTokens(),
}));

vi.mock("@/lib/api/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/client")>(
    "@/lib/api/client",
  );

  return { ...actual, apiFetch: (path: string, init?: RequestInit) => apiFetch(path, init) };
});

const { AccountCards } = await import("./AccountCards");
const { DeleteAccountDialog } = await import("./DeleteAccountDialog");
const { useEmailConfirmation } = await import("@/stores/emailConfirmation");

const Wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
);

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Close my account" }));

  return screen.getByRole("alertdialog");
};

beforeEach(() => {
  useEmailConfirmation.setState({ unconfirmed: false });
  sessionState = {
    status: "authenticated",
    session: { userId: "u1", email: "ruben@correo.es" },
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("AccountCards", () => {
  it("accountCards_session_offersBothWaysOut", () => {
    render(<AccountCards displayName="Rubén" />, { wrapper: Wrapper });

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out on all devices" }),
    ).toBeInTheDocument();
  });

  it("accountCards_email_isShownLeftToRight", async () => {
    const { container } = render(<AccountCards displayName="Rubén" />, {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(container.querySelector('p[dir="ltr"]')).toHaveTextContent(
        "ruben@correo.es",
      ),
    );
  });

  it("accountCards_unconfirmedEmail_saysSoWithoutInventingAConfirmedState", () => {
    useEmailConfirmation.setState({ unconfirmed: true });
    render(<AccountCards displayName="Rubén" />, { wrapper: Wrapper });

    expect(
      screen.getByText("You haven't confirmed this address yet."),
    ).toBeInTheDocument();
  });

  it("accountCards_units_onlyOfferMetres", () => {
    render(<AccountCards displayName="Rubén" />, { wrapper: Wrapper });

    expect(screen.getByText("Units: Metres")).toBeInTheDocument();
  });

  it("accountCards_signOut_revokesThroughTheSessionModuleNotARouteHandler", async () => {
    render(<AccountCards displayName="Rubén" />, { wrapper: Wrapper });

    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(revokeSession).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("accountCards_signOut_navigatesBeforeRevoking", async () => {
    const order: string[] = [];
    replace.mockImplementation(() => order.push("navigate"));
    revokeSession.mockImplementation(() => {
      order.push("revoke");
      return Promise.resolve();
    });
    render(<AccountCards displayName="Rubén" />, { wrapper: Wrapper });

    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(order).toEqual(["navigate", "revoke"]));
  });

  it("accountCards_signOutOnAllDevices_revokesEverySessionThroughTheSessionModule", async () => {
    render(<AccountCards displayName="Rubén" />, { wrapper: Wrapper });

    await userEvent.click(
      screen.getByRole("button", { name: "Sign out on all devices" }),
    );

    await waitFor(() => expect(revokeEverySession).toHaveBeenCalledOnce());
    expect(revokeSession).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("accountCards_offersTheLanguageSwitcherThatB3LeftWithoutACaller", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<AccountCards displayName="Rubén" />, { wrapper: Wrapper });

    await user.click(screen.getByRole("combobox", { name: "Language" }));
    await user.click(await screen.findByRole("option", { name: "العربية" }));

    expect(setLocale).toHaveBeenCalledWith("ar");
  });
});

describe("DeleteAccountDialog", () => {
  it("deleteAccountDialog_enumeratesTheFourConsequences", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DeleteAccountDialog confirmationName="Rubén" />, {
      wrapper: Wrapper,
    });

    const dialog = await openDialog(user);

    expect(within(dialog).getAllByRole("listitem")).toHaveLength(4);
    expect(dialog).toHaveTextContent(
      "Your email address and username will NOT be freed",
    );
    expect(dialog).toHaveTextContent("This can't be undone.");
    expect(dialog).toHaveTextContent("Every session will be closed");
  });

  it("deleteAccountDialog_beforeTyping_keepsTheDestructiveButtonDisabled", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DeleteAccountDialog confirmationName="Rubén" />, {
      wrapper: Wrapper,
    });

    const dialog = await openDialog(user);

    expect(
      within(dialog).getByRole("button", { name: "Close my account" }),
    ).toBeDisabled();
  });

  it("deleteAccountDialog_wrongText_keepsItDisabled", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DeleteAccountDialog confirmationName="Rubén" />, {
      wrapper: Wrapper,
    });

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Confirmation"), "ruben");

    expect(
      within(dialog).getByRole("button", { name: "Close my account" }),
    ).toBeDisabled();
  });

  it("deleteAccountDialog_exactText_unlocksAndDeletes", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DeleteAccountDialog confirmationName="Rubén" />, {
      wrapper: Wrapper,
    });

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Confirmation"), "Rubén");
    await user.type(
      within(dialog).getByLabelText("Enter your password to confirm."),
      "secret1234",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Close my account" }),
    );

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("auth/me", {
        method: "DELETE",
        body: JSON.stringify({ password: "secret1234" }),
      }),
    );
  });

  it("deleteAccountDialog_success_clearsTheSecureStoreAndSaysGoodbye", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DeleteAccountDialog confirmationName="Rubén" />, {
      wrapper: Wrapper,
    });

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Confirmation"), "Rubén");
    await user.type(
      within(dialog).getByLabelText("Enter your password to confirm."),
      "secret1234",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Close my account" }),
    );

    await waitFor(() => expect(clearTokens).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/?deleted=1");
  });

  it("deleteAccountDialog_failure_reportsItWithoutNavigatingAway", async () => {
    apiFetch.mockRejectedValue(
      new ApiError({ status: 409, title: "User.AlreadyDeleted" }),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DeleteAccountDialog confirmationName="Rubén" />, {
      wrapper: Wrapper,
    });

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Confirmation"), "Rubén");
    await user.type(
      within(dialog).getByLabelText("Enter your password to confirm."),
      "secret1234",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Close my account" }),
    );

    await waitFor(() =>
      expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "This account has already been closed.",
      ),
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
