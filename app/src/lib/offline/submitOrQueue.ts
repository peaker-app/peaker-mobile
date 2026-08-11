import { ApiError } from "@/lib/api/client";
import {
  submitAscent,
  type SubmitAscentOptions,
} from "@/lib/ascents/submitAscent";
import { savePhotos } from "./photoStore";
import { enqueueAscent, type QueuedPeak } from "./queue";

export type SubmitOutcome =
  | { status: "submitted"; ascentId: string; failedPhotos: number }
  | {
      status: "queued";
      clientAscentId: string;
      keptPhotos: number;
      droppedPhotos: number;
    };

export interface SubmitOrQueueOptions extends SubmitAscentOptions {
  peak: QueuedPeak;
}

export const submitOrQueue = async ({
  peak,
  ...options
}: SubmitOrQueueOptions): Promise<SubmitOutcome> => {
  const clientAscentId = crypto.randomUUID();
  const request = { ...options.request, clientAscentId };

  try {
    const { ascentId, failedPhotos } = await submitAscent({
      ...options,
      request,
    });

    return { status: "submitted", ascentId, failedPhotos };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const { stored, dropped } = await savePhotos(clientAscentId, options.photos);

    enqueueAscent({
      clientAscentId,
      request,
      peak,
      queuedAtUtc: new Date().toISOString(),
      photos: stored,
      droppedPhotos: dropped,
      status: "pending",
      attempts: 0,
    });

    return {
      status: "queued",
      clientAscentId,
      keptPhotos: stored.length,
      droppedPhotos: dropped,
    };
  }
};
