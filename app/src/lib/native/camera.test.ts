import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NativeCamera } from "./camera";

vi.mock("@capacitor/camera", () => ({
  Camera: {},
  MediaTypeSelection: { Photo: 0, Video: 1, All: 2 },
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

const { createNativePicker, createWebPicker, remainingSlots } = await import(
  "./camera"
);

const webPath = "https://localhost/_capacitor_file_/data/photo.jpg";

const nativeCamera = (
  overrides: Partial<NativeCamera> = {},
): NativeCamera => ({
  takePhoto: vi
    .fn()
    .mockResolvedValue({ webPath, metadata: { format: "image/jpeg" } }),
  chooseFromGallery: vi.fn().mockResolvedValue({
    results: [{ webPath, metadata: { format: "image/jpeg" } }],
  }),
  ...overrides,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  fetchMock.mockResolvedValue(
    new Response(new Blob(["binary"], { type: "image/jpeg" })),
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("createNativePicker", () => {
  it("nativePicker_takePhoto_resizesBeforeCrossingTheBridge", async () => {
    const plugin = nativeCamera();

    await createNativePicker(plugin).takePhoto();

    expect(plugin.takePhoto).toHaveBeenCalledWith({
      quality: 80,
      targetWidth: 1600,
      correctOrientation: true,
    });
  });

  it("nativePicker_takePhoto_returnsAFileReadyForSelectPhotos", async () => {
    const outcome = await createNativePicker(nativeCamera()).takePhoto();

    expect(outcome.status).toBe("picked");
    expect(outcome.status === "picked" && outcome.files[0]?.type).toBe(
      "image/jpeg",
    );
  });

  it("nativePicker_takePhoto_readsTheFileThroughTheWebViewPath", async () => {
    await createNativePicker(nativeCamera()).takePhoto();

    expect(fetchMock).toHaveBeenCalledWith(webPath);
  });

  it("nativePicker_gallery_asksForMultipleOnlyWhenThereIsRoom", async () => {
    const plugin = nativeCamera();

    await createNativePicker(plugin).chooseFromGallery(1);
    await createNativePicker(plugin).chooseFromGallery(3);

    expect(plugin.chooseFromGallery).toHaveBeenNthCalledWith(1, {
      mediaType: 0,
      allowMultipleSelection: false,
      limit: 1,
    });
    expect(plugin.chooseFromGallery).toHaveBeenNthCalledWith(2, {
      mediaType: 0,
      allowMultipleSelection: true,
      limit: 3,
    });
  });

  it("nativePicker_gallery_dropsResultsWithoutAPath", async () => {
    const plugin = nativeCamera({
      chooseFromGallery: vi
        .fn()
        .mockResolvedValue({ results: [{ webPath }, {}] }),
    });

    const outcome = await createNativePicker(plugin).chooseFromGallery(3);

    expect(outcome.status === "picked" && outcome.files).toHaveLength(1);
  });

  it("nativePicker_emptySelection_isCancelledNotDenied", async () => {
    const plugin = nativeCamera({
      chooseFromGallery: vi.fn().mockResolvedValue({ results: [] }),
    });

    const outcome = await createNativePicker(plugin).chooseFromGallery(3);

    expect(outcome.status).toBe("cancelled");
  });

  it("nativePicker_pluginFailure_isDenied", async () => {
    const plugin = nativeCamera({
      takePhoto: vi.fn().mockRejectedValue(new Error("permission denied")),
    });

    const outcome = await createNativePicker(plugin).takePhoto();

    expect(outcome.status).toBe("denied");
  });

  it("nativePicker_missingFormat_fallsBackToJpeg", async () => {
    fetchMock.mockResolvedValue(new Response(new Blob(["binary"])));
    const plugin = nativeCamera({
      takePhoto: vi.fn().mockResolvedValue({ webPath }),
    });

    const outcome = await createNativePicker(plugin).takePhoto();

    expect(outcome.status === "picked" && outcome.files[0]?.type).toBe(
      "image/jpeg",
    );
  });
});

describe("createWebPicker", () => {
  const clickWithFiles = (files: File[]) => {
    vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(
      function (this: HTMLInputElement) {
        Object.defineProperty(this, "files", { value: files });
        this.dispatchEvent(new Event("change"));
      },
    );
  };

  it("webPicker_selection_returnsTheChosenFiles", async () => {
    const file = new File(["binary"], "peak.jpg", { type: "image/jpeg" });
    clickWithFiles([file]);

    const outcome = await createWebPicker().takePhoto();

    expect(outcome.status === "picked" && outcome.files).toEqual([file]);
  });

  it("webPicker_noSelection_isCancelled", async () => {
    clickWithFiles([]);

    const outcome = await createWebPicker().chooseFromGallery(3);

    expect(outcome.status).toBe("cancelled");
  });
});

describe("remainingSlots", () => {
  it("remainingSlots_withRoom_countsWhatIsLeft", () => {
    expect(remainingSlots(0)).toBe(3);
    expect(remainingSlots(2)).toBe(1);
  });

  it("remainingSlots_whenFull_neverAsksForZero", () => {
    expect(remainingSlots(3)).toBe(1);
  });
});
