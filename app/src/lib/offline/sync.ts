import { ApiError } from "@/lib/api/client";
import { isRetryable, problemCodes } from "@/lib/api/problem";
import { submitAscent } from "@/lib/ascents/submitAscent";
import { getSessionState } from "@/lib/auth/sessionStore";
import { ownerScopes, queryClient } from "@/lib/queryClient";
import { deletePhotos, readPhotos } from "./photoStore";
import {
  dropQueuedAscent,
  markAttempted,
  markRejected,
  queuedAscents,
  type QueuedAscent,
} from "./queue";

type ReplayOutcome = "synced" | "rejected" | "unreachable";

let inFlight: Promise<void> | undefined;

const invalidateOwnerData = (): void => {
  for (const scope of ownerScopes) {
    void queryClient.invalidateQueries({ queryKey: [scope] });
  }
};

const replay = async (entry: QueuedAscent): Promise<ReplayOutcome> => {
  markAttempted(entry.clientAscentId);

  try {
    await submitAscent({
      request: entry.request,
      photos: await readPhotos(entry.photos),
    });
    await deletePhotos(entry.photos);
    dropQueuedAscent(entry.clientAscentId);

    return "synced";
  } catch (error) {
    if (!(error instanceof ApiError) || isRetryable(error.problem)) {
      return "unreachable";
    }

    const [code] = problemCodes(error.problem);
    markRejected(entry.clientAscentId, code ?? `status.${error.problem.status}`);

    return "rejected";
  }
};

const drainQueue = async (): Promise<void> => {
  let synced = 0;

  if (getSessionState().status !== "authenticated") {
    return;
  }

  for (const entry of queuedAscents().filter(
    (queued) => queued.status === "pending",
  )) {
    const outcome = await replay(entry);

    if (outcome === "unreachable") {
      break;
    }

    synced += outcome === "synced" ? 1 : 0;
  }

  if (synced > 0) {
    invalidateOwnerData();
  }
};

export const syncQueuedAscents = async (): Promise<void> => {
  inFlight ??= drainQueue().finally(() => {
    inFlight = undefined;
  });

  return inFlight;
};
