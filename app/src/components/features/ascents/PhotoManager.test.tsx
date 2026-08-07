import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/en.json";
import type { AscentPhotoResponse } from "@/types/api";

const apiFetch = vi.fn();
const refresh = vi.fn();

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ refresh }) }));

vi.mock("@/lib/native/camera", () => ({
  picker: {
    takePhoto: vi.fn().mockResolvedValue({ status: "cancelled" }),
    chooseFromGallery: vi.fn().mockResolvedValue({ status: "cancelled" }),
  },
  remainingSlots: (taken: number) => Math.max(3 - taken, 1),
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

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

const { PhotoManager } = await import("./PhotoManager");

const Wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
);

const photo = (id: string, position: number): AscentPhotoResponse => ({
  id,
  secureUrl: `https://img/${id}.jpg`,
  width: 1200,
  height: 900,
  position,
  uploadedAtUtc: "2026-07-20T10:00:00Z",
});

const renderManager = (photos: AscentPhotoResponse[]) =>
  render(
    <PhotoManager ascentId="ascent-1" photos={photos} peakName="Aneto" />,
    { wrapper: Wrapper },
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe("PhotoManager", () => {
  it("photoManager_noPhotos_invitesToAddThem", () => {
    renderManager([]);

    expect(
      screen.getByText("No photos yet. Add the ones you took on the summit."),
    ).toBeInTheDocument();
    expect(screen.getByText("Take a photo")).toBeInTheDocument();
  });

  it("photoManager_belowTheLimit_showsTheUploadZone", () => {
    renderManager([photo("a", 0), photo("b", 1)]);

    expect(screen.getByText("Take a photo")).toBeInTheDocument();
    expect(screen.queryByText("Maximum 3 photos.")).toBeNull();
  });

  it("photoManager_atTheLimit_hidesTheUploadZoneInsteadOfDisablingIt", () => {
    renderManager([photo("a", 0), photo("b", 1), photo("c", 2)]);

    expect(screen.queryByText("Take a photo")).toBeNull();
    expect(screen.getByText("Maximum 3 photos.")).toBeInTheDocument();
  });

  it("photoManager_takePhoto_uploadsItUnderTheFileFieldAndRefreshes", async () => {
    const { picker } = await import("@/lib/native/camera");
    const { apiUpload } = await import("@/lib/api/client");
    vi.mocked(picker.takePhoto).mockResolvedValue({
      status: "picked",
      files: [new File(["x"], "shot.jpg", { type: "image/jpeg" })],
    });
    renderManager([]);

    await userEvent.click(screen.getByRole("button", { name: /Take a photo/ }));

    await waitFor(() => expect(apiUpload).toHaveBeenCalledTimes(1));
    const [path, body] = vi.mocked(apiUpload).mock.calls[0] ?? [];
    expect(path).toBe("ascents/ascent-1/photos");
    expect((body as FormData).get("file")).toBeInstanceOf(File);
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("photoManager_gallery_onlyAsksForTheRemainingSlots", async () => {
    const { picker } = await import("@/lib/native/camera");
    renderManager([photo("a", 0), photo("b", 1)]);

    await userEvent.click(
      screen.getByRole("button", { name: "Choose from gallery" }),
    );

    expect(picker.chooseFromGallery).toHaveBeenCalledWith(1);
  });

  it("photoManager_deleteButtons_nameThePhotoTheyRemove", () => {
    renderManager([photo("a", 0), photo("b", 1)]);

    expect(
      screen.getByRole("button", { name: "Delete photo 2 of 2" }),
    ).toBeInTheDocument();
  });

  it("photoManager_delete_asksForConfirmationFirst", async () => {
    renderManager([photo("a", 0)]);

    await userEvent.click(
      screen.getByRole("button", { name: "Delete photo 1 of 1" }),
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("photoManager_deleteConfirmed_waitsForTheServerInsteadOfActingOptimistically", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderManager([photo("a", 0), photo("b", 1)]);

    await user.click(
      screen.getByRole("button", { name: "Delete photo 1 of 2" }),
    );
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete photo",
      }),
    );

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("ascents/ascent-1/photos/a", {
        method: "DELETE",
      }),
    );
    expect(screen.getAllByRole("img")).toHaveLength(2);
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("photoManager_photos_haveGeneratedAlternativeText", () => {
    renderManager([photo("a", 0)]);

    expect(
      screen.getByAltText("Photo 1 of the ascent of Aneto"),
    ).toBeInTheDocument();
  });
});
