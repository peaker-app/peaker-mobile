import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";

const replace = vi.fn();
const refresh = vi.fn();
const signOutMock = vi.fn<() => Promise<void>>();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/auth/session", () => ({
  signOut: () => signOutMock(),
}));

const { SignOutButton } = await import("./SignOutButton");

const press = () =>
  userEvent.click(screen.getByRole("button", { name: "Sign out" }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("SignOutButton", () => {
  it("signOutButton_pressed_revokesTheSession", async () => {
    signOutMock.mockResolvedValue(undefined);
    renderWithProviders(<SignOutButton />);

    await press();

    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
  });

  it("signOutButton_pressed_leavesThePrivateAreaBeforeTheStoreGoesAnonymous", async () => {
    let release = (): void => undefined;
    signOutMock.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    renderWithProviders(<SignOutButton />);

    await press();

    expect(replace).toHaveBeenCalledWith("/peaks");
    expect(refresh).not.toHaveBeenCalled();
    release();
  });

  it("signOutButton_afterRevoking_dropsTheQueryCache", async () => {
    signOutMock.mockResolvedValue(undefined);
    renderWithProviders(<SignOutButton />);

    await press();

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it("signOutButton_whileRunning_staysDisabled", async () => {
    signOutMock.mockReturnValue(new Promise<void>(() => undefined));
    renderWithProviders(<SignOutButton />);

    await press();

    expect(screen.getByRole("button", { name: "Sign out" })).toBeDisabled();
  });
});
