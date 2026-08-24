import { Directory, Filesystem } from "@capacitor/filesystem";
import type { PhotoCandidate } from "@/lib/ascents/photos";

export interface StoredPhoto {
  path: string;
  name: string;
  type: string;
}

export interface SavedPhotos {
  stored: StoredPhoto[];
  dropped: number;
}

const directory = Directory.Data;

const prefix = "peaker-offline";

const pathOf = (clientAscentId: string, index: number): string =>
  `${prefix}-${clientAscentId}-${index}`;

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    });
    reader.addEventListener("error", () => reject(new Error("unreadable")));
    reader.readAsDataURL(file);
  });

const toBytes = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return buffer;
};

const writeOne = async (
  photo: PhotoCandidate,
  path: string,
): Promise<StoredPhoto> => {
  await Filesystem.writeFile({
    path,
    directory,
    data: await toBase64(photo.file),
  });

  return { path, name: photo.file.name, type: photo.file.type };
};

export const savePhotos = async (
  clientAscentId: string,
  photos: readonly PhotoCandidate[],
): Promise<SavedPhotos> => {
  const stored: StoredPhoto[] = [];
  let dropped = 0;

  for (const [index, photo] of photos.entries()) {
    try {
      stored.push(await writeOne(photo, pathOf(clientAscentId, index)));
    } catch {
      dropped += 1;
    }
  }

  return { stored, dropped };
};

const readOne = async (
  photo: StoredPhoto,
): Promise<PhotoCandidate | undefined> => {
  try {
    const { data } = await Filesystem.readFile({ path: photo.path, directory });

    if (typeof data !== "string") {
      return undefined;
    }

    const file = new File([toBytes(data)], photo.name, { type: photo.type });

    return { id: photo.path, file, previewUrl: URL.createObjectURL(file) };
  } catch {
    return undefined;
  }
};

export const readPhotos = async (
  stored: readonly StoredPhoto[],
): Promise<PhotoCandidate[]> => {
  const candidates = await Promise.all(stored.map(readOne));

  return candidates.filter(
    (candidate): candidate is PhotoCandidate => candidate !== undefined,
  );
};

export const deletePhotos = async (
  stored: readonly StoredPhoto[],
): Promise<void> => {
  await Promise.all(
    stored.map((photo) =>
      Filesystem.deleteFile({ path: photo.path, directory }).catch(
        () => undefined,
      ),
    ),
  );
};
