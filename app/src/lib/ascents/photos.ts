export const maxPhotos = 3;
export const maxPhotoBytes = 10 * 1024 * 1024;
export const maxPhotoMegabytes = 10;
export const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export type PhotoRejection = "tooLarge" | "unsupported" | "tooMany";

export interface PhotoCandidate {
  id: string;
  file: File;
  previewUrl: string;
}

export interface PhotoSelection {
  accepted: PhotoCandidate[];
  rejected: { name: string; reason: PhotoRejection }[];
}

export const selectPhotos = (
  current: readonly PhotoCandidate[],
  incoming: readonly File[],
  createPreview: (file: File) => string,
): PhotoSelection => {
  const accepted: PhotoCandidate[] = [];
  const rejected: PhotoSelection["rejected"] = [];
  let room = maxPhotos - current.length;

  for (const file of incoming) {
    if (room <= 0) {
      rejected.push({ name: file.name, reason: "tooMany" });
      continue;
    }

    if (!allowedPhotoTypes.includes(file.type)) {
      rejected.push({ name: file.name, reason: "unsupported" });
      continue;
    }

    if (file.size > maxPhotoBytes) {
      rejected.push({ name: file.name, reason: "tooLarge" });
      continue;
    }

    accepted.push({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      previewUrl: createPreview(file),
    });
    room -= 1;
  }

  return { accepted, rejected };
};

export const movePhoto = <T>(
  photos: readonly T[],
  from: number,
  to: number,
): T[] => {
  if (to < 0 || to >= photos.length) {
    return [...photos];
  }

  const next = [...photos];
  const [moved] = next.splice(from, 1);

  if (moved !== undefined) {
    next.splice(to, 0, moved);
  }

  return next;
};
