import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionState } from "@/lib/auth/sessionStore";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { ProfileResponse } from "@/types/api";

const authenticated: SessionState = {
  status: "authenticated",
  session: { userId: "u-1", email: "ana@peaker.app" },
};

const setLocale = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  useSessionState: () => authenticated,
  signOut: () => Promise.resolve(),
}));

vi.mock("@/i18n/LocaleProvider", () => ({
  useLocaleSetting: () => ({ locale: "en", setLocale }),
}));

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

const { AccountScreen } = await import("./AccountScreen");

const profile: ProfileResponse = {
  id: "p-1",
  userId: "u-1",
  displayName: "Ana",
  slug: "ana",
  bio: null,
  avatarUrl: null,
  countryCode: "ES",
  visibility: "Public",
};

const fetchMock = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  fetchMock.mockImplementation(() =>
    Promise.resolve(jsonResponse(profile).clone()),
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AccountScreen", () => {
  it("accountScreen_authenticated_showsTheAddressLeftToRight", async () => {
    renderWithProviders(<AccountScreen />);

    expect(await screen.findByText("ana@peaker.app")).toHaveAttribute(
      "dir",
      "ltr",
    );
  });

  it("accountScreen_emailCard_linksToTheResendScreen", () => {
    renderWithProviders(<AccountScreen />);

    expect(
      screen.getByRole("link", { name: "Send me the confirmation link" }),
    ).toHaveAttribute("href", "/confirm-email/pending");
  });

  it("accountScreen_sessionCard_offersBothWaysOut", () => {
    renderWithProviders(<AccountScreen />);

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out on all devices" }),
    ).toBeInTheDocument();
  });

  it("accountScreen_givesSC16ItsOnlyEntryPoint", () => {
    renderWithProviders(<AccountScreen />);

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/dashboard/settings/profile",
    );
  });

  it("accountScreen_dangerZone_confirmsWithTheDisplayNameItLoaded", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderWithProviders(<AccountScreen />);

    await screen.findByText("ana@peaker.app");
    await user.click(screen.getByRole("button", { name: "Close my account" }));

    const dialog = await screen.findByRole("alertdialog");

    expect(dialog).toHaveTextContent("Type Ana to confirm.");
    expect(
      within(dialog).getByRole("button", { name: "Close my account" }),
    ).toBeDisabled();
  });

  it("accountScreen_preferencesCard_bringsBackTheLanguageSwitcher", () => {
    renderWithProviders(<AccountScreen />);

    expect(
      screen.getByRole("combobox", { name: "Language" }),
    ).toBeInTheDocument();
  });
});
