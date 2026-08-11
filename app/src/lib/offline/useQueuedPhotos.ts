import { useEffect, useState } from "react";
import type { PhotoCandidate } from "@/lib/ascents/photos";
import { readPhotos, type StoredPhoto } from "./photoStore";

export const useQueuedPhotos = (
  stored: readonly StoredPhoto[],
): PhotoCandidate[] => {
  const [photos, setPhotos] = useState<PhotoCandidate[]>([]);
  const serialized = JSON.stringify(stored);

  useEffect(() => {
    let loaded: PhotoCandidate[] = [];
    let cancelled = false;

    void readPhotos(JSON.parse(serialized) as StoredPhoto[]).then(
      (candidates) => {
        loaded = candidates;

        if (cancelled) {
          return;
        }

        setPhotos(candidates);
      },
    );

    return () => {
      cancelled = true;

      for (const photo of loaded) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, [serialized]);

  return photos;
};
