import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { picker } from "@/lib/native/camera";

const apiFetch = vi.fn();
const apiUpload = vi.fn();
const refresh = vi.fn();

vi.mock("@/lib/native/camera", () => ({
  picker: { takePhoto: vi.fn(), chooseFromGallery: vi.fn() },
  remainingSlots: (taken: number) => Math.max(3 - taken, 1),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh }),
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
    apiUpload: (path: string, body: FormData) => apiUpload(path, body),
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { AvatarUploader } = await import("./AvatarUploader");

const shot = (bytes = 1) =>
  new File([new Uint8Array(bytes)], "avatar.jpg", { type: "image/jpeg" });

const renderUploader = (avatarUrl: string | null = null) =>
  render(<AvatarUploader avatarUrl={avatarUrl} displayName="Rubén" />, {
    wrapper: IntlWrapper,
  });

beforeEach(() => {
  apiUpload.mockResolvedValue({ avatarUrl: "https://cdn/avatar.jpg" });
  apiFetch.mockResolvedValue(undefined);
  vi.mocked(picker.takePhoto).mockResolvedValue({ status: "cancelled" });
  vi.mocked(picker.chooseFromGallery).mockResolvedValue({
    status: "cancelled",
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AvatarUploader", () => {
  it("avatarUploader_offersCameraAndGalleryInsteadOfAFileInput", () => {
    const { container } = renderUploader();

    expect(
      screen.getByRole("button", { name: "Take a photo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose from gallery" }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it("avatarUploader_takePhoto_uploadsItUnderTheFileField", async () => {
    vi.mocked(picker.takePhoto).mockResolvedValue({
      status: "picked",
      files: [shot()],
    });
    renderUploader();

    await userEvent.click(screen.getByRole("button", { name: "Take a photo" }));

    await waitFor(() => expect(apiUpload).toHaveBeenCalledOnce());
    const [path, body] = apiUpload.mock.calls[0] as [string, FormData];
    expect(path).toBe("profiles/me/avatar");
    expect(body.get("file")).toBeInstanceOf(File);
  });

  it("avatarUploader_gallery_asksForASingleImage", async () => {
    vi.mocked(picker.chooseFromGallery).mockResolvedValue({
      status: "picked",
      files: [shot()],
    });
    renderUploader();

    await userEvent.click(
      screen.getByRole("button", { name: "Choose from gallery" }),
    );

    await waitFor(() => expect(picker.chooseFromGallery).toHaveBeenCalledWith(1));
  });

  it("avatarUploader_deniedPermission_saysSoAndUploadsNothing", async () => {
    vi.mocked(picker.takePhoto).mockResolvedValue({ status: "denied" });
    renderUploader();

    await userEvent.click(screen.getByRole("button", { name: "Take a photo" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check the app permissions.",
    );
    expect(apiUpload).not.toHaveBeenCalled();
  });

  it("avatarUploader_cancelled_doesNothingAtAll", async () => {
    renderUploader();

    await userEvent.click(screen.getByRole("button", { name: "Take a photo" }));

    expect(apiUpload).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("avatarUploader_oversizedImage_isRejectedBeforeCrossingTheBridge", async () => {
    vi.mocked(picker.chooseFromGallery).mockResolvedValue({
      status: "picked",
      files: [shot(6 * 1024 * 1024)],
    });
    renderUploader();

    await userEvent.click(
      screen.getByRole("button", { name: "Choose from gallery" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The image can't be larger than 5 MB.",
    );
    expect(apiUpload).not.toHaveBeenCalled();
  });

  it("avatarUploader_remove_asksForConfirmationBeforeDeleting", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderUploader("https://cdn/avatar.jpg");

    await user.click(screen.getByRole("button", { name: "Remove photo" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Remove your photo?");
    expect(apiFetch).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: "Remove photo" }),
    );

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("profiles/me/avatar", {
        method: "DELETE",
      }),
    );
  });

  it("avatarUploader_withoutAnAvatar_doesNotOfferToRemoveIt", () => {
    renderUploader();

    expect(
      screen.queryByRole("button", { name: "Remove photo" }),
    ).not.toBeInTheDocument();
  });
});
