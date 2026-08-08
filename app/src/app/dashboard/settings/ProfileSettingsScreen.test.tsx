import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { ProfileResponse } from "@/types/api";

vi.mock("@/lib/native/camera", () => ({
  picker: { takePhoto: vi.fn(), chooseFromGallery: vi.fn() },
  remainingSlots: (taken: number) => Math.max(3 - taken, 1),
}));

const { ProfileSettingsScreen } = await import("./ProfileSettingsScreen");

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

const respondWith = (response: Response) => {
  fetchMock.mockImplementation(() => Promise.resolve(response.clone()));
};

const route = "/dashboard/settings/profile";

beforeEach(() => {
  respondWith(jsonResponse(profile));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ProfileSettingsScreen", () => {
  it("profileSettingsScreen_loaded_showsTheThreeIndependentForms", async () => {
    renderWithProviders(<ProfileSettingsScreen />, { route });

    expect(await screen.findByText("Photo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save address" })).toBeInTheDocument();
  });

  it("profileSettingsScreen_linksToTheOwnPublicProfileBySlug", async () => {
    renderWithProviders(<ProfileSettingsScreen />, { route });

    expect(
      await screen.findByRole("link", { name: "See my public profile" }),
    ).toHaveAttribute("href", "/climbers/ana");
  });

  it("profileSettingsScreen_savingDetails_sendsTheFourFieldsToTheProfileEndpoint", async () => {
    renderWithProviders(<ProfileSettingsScreen />, { route });

    await userEvent.click(
      await screen.findByRole("button", { name: "Save details" }),
    );

    const put = fetchMock.mock.calls.find(
      (call) => (call[1] as RequestInit | undefined)?.method === "PUT",
    );

    expect(String(put?.[0])).toContain("/profiles/me");
    expect(JSON.parse(String((put?.[1] as RequestInit).body))).toEqual({
      displayName: "Ana",
      bio: null,
      countryCode: "ES",
      visibility: "Public",
    });
  });

  it("profileSettingsScreen_profileNotProjectedYet_offersToRetryInsteadOfFailing", async () => {
    respondWith(jsonResponse({ title: "Profile.NotFound" }, 404));

    renderWithProviders(<ProfileSettingsScreen />, { route });

    expect(await screen.findByText("Preparing your profile…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("profileSettingsScreen_keepsItsHeadingWhateverTheQueryDoes", async () => {
    respondWith(jsonResponse({ title: "Profile.NotFound" }, 404));

    renderWithProviders(<ProfileSettingsScreen />, { route });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Profile" }),
    ).toBeInTheDocument();
  });
});
