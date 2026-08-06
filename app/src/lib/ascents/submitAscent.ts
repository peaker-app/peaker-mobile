import { apiFetch, apiUpload } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PhotoCandidate } from "@/lib/ascents/photos";
import type { RegisterAscentRequest } from "@/types/api";

export interface SubmitProgressState {
  phase: "ascent" | "photos" | "done";
  current: number;
  total: number;
}

export interface SubmitAscentResult {
  ascentId: string;
  failedPhotos: number;
}

export interface SubmitAscentOptions {
  request: RegisterAscentRequest;
  photos: readonly PhotoCandidate[];
  onProgress?: (state: SubmitProgressState) => void;
}

const photoBody = (photo: PhotoCandidate): FormData => {
  const body = new FormData();
  body.append("file", photo.file);

  return body;
};

export const submitAscent = async ({
  request,
  photos,
  onProgress,
}: SubmitAscentOptions): Promise<SubmitAscentResult> => {
  onProgress?.({ phase: "ascent", current: 0, total: photos.length });

  const ascentId = await apiFetch<string>(endpoints.ascents.root, {
    method: "POST",
    body: JSON.stringify(request),
  });

  let failedPhotos = 0;

  for (const [index, photo] of photos.entries()) {
    onProgress?.({
      phase: "photos",
      current: index + 1,
      total: photos.length,
    });

    try {
      await apiUpload(endpoints.ascents.photos(ascentId), photoBody(photo));
    } catch {
      failedPhotos += 1;
    }
  }

  onProgress?.({ phase: "done", current: photos.length, total: photos.length });

  return { ascentId, failedPhotos };
};
