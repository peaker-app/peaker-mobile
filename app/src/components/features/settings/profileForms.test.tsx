import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { ApiError } from "@/lib/api/client";
import type { ProfileResponse } from "@/types/api";

const apiFetch = vi.fn();
const refresh = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh, replace: vi.fn() }),
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/api/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/client")>(
    "@/lib/api/client",
  );

  return {
    ...actual,
    apiFetch: (path: string, init?: RequestInit) => apiFetch(path, init),
    apiUpload: vi.fn(),
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { ProfileDataForm } = await import("./ProfileDataForm");
const { SlugForm } = await import("./SlugForm");

const profile: ProfileResponse = {
  id: "p1",
  userId: "u1",
  displayName: "Rubén",
  slug: "ruben",
  bio: "Pirineos",
  avatarUrl: null,
  countryCode: "ES",
  visibility: "Public",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("ProfileDataForm", () => {
  it("profileDataForm_save_sendsTheFourFieldsAsFullReplacement", async () => {
    apiFetch.mockResolvedValue(undefined);
    render(<ProfileDataForm profile={profile} />, { wrapper: IntlWrapper });

    await userEvent.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [path, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(path).toBe("profiles/me");
    expect(init.method).toBe("PUT");
    expect(Object.keys(JSON.parse(String(init.body))).sort()).toEqual([
      "bio",
      "countryCode",
      "displayName",
      "visibility",
    ]);
  });

  it("profileDataForm_emptyBio_travelsAsExplicitNull", async () => {
    apiFetch.mockResolvedValue(undefined);
    render(<ProfileDataForm profile={{ ...profile, bio: null }} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(JSON.parse(String(init.body)).bio).toBeNull();
  });

  it("profileDataForm_blankDisplayName_isRejectedBeforeCallingTheApi", async () => {
    render(<ProfileDataForm profile={profile} />, { wrapper: IntlWrapper });

    await userEvent.clear(screen.getByLabelText("Display name"));
    await userEvent.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() =>
      expect(screen.getByText("Enter a display name.")).toBeInTheDocument(),
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("profileDataForm_helpText_saysTheUsernameCannotBeChanged", () => {
    render(<ProfileDataForm profile={profile} />, { wrapper: IntlWrapper });

    expect(
      screen.getByText(/it isn't your username: that one can't be changed/),
    ).toBeInTheDocument();
  });

  it("profileDataForm_switchingToPrivate_asksForConfirmationFirst", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<ProfileDataForm profile={profile} />, { wrapper: IntlWrapper });

    await user.click(screen.getByLabelText("Profile visibility"));
    await user.click(screen.getByRole("option", { name: "Private" }));
    await user.click(screen.getByRole("button", { name: "Save details" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "your public ascents will stop being visible",
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("profileDataForm_privateConfirmed_savesWithTheNewVisibility", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<ProfileDataForm profile={profile} />, { wrapper: IntlWrapper });

    await user.click(screen.getByLabelText("Profile visibility"));
    await user.click(screen.getByRole("option", { name: "Private" }));
    await user.click(screen.getByRole("button", { name: "Save details" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Make it private",
      }),
    );

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(JSON.parse(String(init.body)).visibility).toBe("Private");
  });

  it("profileDataForm_serverRejection_marksTheOffendingField", async () => {
    apiFetch.mockRejectedValue(
      new ApiError({ status: 400, title: "Profile.BioTooLong" }),
    );
    render(<ProfileDataForm profile={profile} />, { wrapper: IntlWrapper });

    await userEvent.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() =>
      expect(
        screen.getByText("Your bio can't be longer than 500 characters."),
      ).toBeInTheDocument(),
    );
  });
});

describe("SlugForm", () => {
  it("slugForm_render_warnsThatOldLinksBreakBeforeSaving", () => {
    render(<SlugForm slug="ruben" />, { wrapper: IntlWrapper });

    expect(
      screen.getByText(/Changing it breaks every link you shared/),
    ).toBeInTheDocument();
  });

  it("slugForm_preview_staysLeftToRight", () => {
    const { container } = render(<SlugForm slug="ruben" />, {
      wrapper: IntlWrapper,
    });

    expect(container.querySelector('p[dir="ltr"]')).toHaveTextContent(
      "/climbers/ruben",
    );
  });

  it("slugForm_save_onlyTouchesTheSlugEndpoint", async () => {
    apiFetch.mockResolvedValue(undefined);
    render(<SlugForm slug="ruben" />, { wrapper: IntlWrapper });

    await userEvent.click(screen.getByRole("button", { name: "Save address" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [path, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(path).toBe("profiles/me/slug");
    expect(JSON.parse(String(init.body))).toEqual({ slug: "ruben" });
  });

  it("slugForm_invalidFormat_isRejectedBeforeCallingTheApi", async () => {
    render(<SlugForm slug="ruben" />, { wrapper: IntlWrapper });

    await userEvent.clear(screen.getByLabelText("Your address"));
    await userEvent.type(screen.getByLabelText("Your address"), "Rubén Val");
    await userEvent.click(screen.getByRole("button", { name: "Save address" }));

    await waitFor(() =>
      expect(
        screen.getByText(
          "Use lowercase letters, digits and hyphens, up to 80 characters.",
        ),
      ).toBeInTheDocument(),
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("slugForm_takenSlug_isShownOnItsField", async () => {
    apiFetch.mockRejectedValue(
      new ApiError({ status: 409, title: "Profile.SlugAlreadyTaken" }),
    );
    render(<SlugForm slug="ruben" />, { wrapper: IntlWrapper });

    await userEvent.click(screen.getByRole("button", { name: "Save address" }));

    await waitFor(() =>
      expect(
        screen.getByText("That address is already taken."),
      ).toBeInTheDocument(),
    );
  });
});
