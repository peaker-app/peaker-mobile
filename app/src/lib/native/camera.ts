import { Camera, MediaTypeSelection } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { allowedPhotoTypes, maxPhotos } from "@/lib/ascents/photos";

export type PickOutcome =
  | { status: "picked"; files: File[] }
  | { status: "cancelled" }
  | { status: "denied" };

export interface PhotoPicker {
  takePhoto(): Promise<PickOutcome>;
  chooseFromGallery(limit: number): Promise<PickOutcome>;
}

interface NativeMediaResult {
  webPath?: string;
  metadata?: { format?: string };
}

export interface NativeCamera {
  takePhoto(options: {
    quality: number;
    targetWidth: number;
    correctOrientation: boolean;
  }): Promise<NativeMediaResult>;
  chooseFromGallery(options: {
    mediaType: MediaTypeSelection;
    allowMultipleSelection: boolean;
    limit: number;
  }): Promise<{ results: NativeMediaResult[] }>;
}

const captureQuality = 80;
const captureWidth = 1600;

const cancelled: PickOutcome = { status: "cancelled" };
const denied: PickOutcome = { status: "denied" };

const defaultMime = "image/jpeg";

const extensionOf = (mime: string): string => mime.split("/").pop() ?? "jpeg";

const asMime = (format: string): string =>
  format.includes("/") ? format : `image/${format}`;

const mimeOf = (result: NativeMediaResult, blob: Blob): string => {
  const declared = result.metadata?.format;

  if (declared) {
    return asMime(declared);
  }

  return allowedPhotoTypes.includes(blob.type) ? blob.type : defaultMime;
};

const toFile = async (result: NativeMediaResult): Promise<File | undefined> => {
  if (!result.webPath) {
    return undefined;
  }

  const blob = await (await fetch(result.webPath)).blob();
  const type = mimeOf(result, blob);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionOf(type)}`;

  return new File([blob], name, { type, lastModified: Date.now() });
};

const toFiles = async (results: NativeMediaResult[]): Promise<File[]> => {
  const files = await Promise.all(results.map(toFile));

  return files.filter((file): file is File => file !== undefined);
};

const picked = (files: File[]): PickOutcome =>
  files.length > 0 ? { status: "picked", files } : cancelled;

export const createNativePicker = (plugin: NativeCamera): PhotoPicker => ({
  takePhoto: async () => {
    try {
      return picked(
        await toFiles([
          await plugin.takePhoto({
            quality: captureQuality,
            targetWidth: captureWidth,
            correctOrientation: true,
          }),
        ]),
      );
    } catch {
      return denied;
    }
  },
  chooseFromGallery: async (limit) => {
    try {
      const { results } = await plugin.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
        allowMultipleSelection: limit > 1,
        limit,
      });

      return picked(await toFiles(results));
    } catch {
      return denied;
    }
  },
});

const openFileDialog = (multiple: boolean): Promise<File[]> =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = allowedPhotoTypes.join(",");
    input.multiple = multiple;
    input.addEventListener("change", () => resolve([...(input.files ?? [])]));
    input.addEventListener("cancel", () => resolve([]));
    input.click();
  });

export const createWebPicker = (): PhotoPicker => ({
  takePhoto: async () => picked(await openFileDialog(false)),
  chooseFromGallery: async (limit) =>
    picked(await openFileDialog(limit > 1)),
});

export const remainingSlots = (taken: number): number =>
  Math.max(maxPhotos - taken, 1);

export const picker: PhotoPicker = Capacitor.isNativePlatform()
  ? createNativePicker(Camera)
  : createWebPicker();
