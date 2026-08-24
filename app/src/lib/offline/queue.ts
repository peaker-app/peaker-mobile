import { createPersistedStore } from "@/stores/persistedStore";
import type { RegisterAscentRequest } from "@/types/api";
import { deletePhotos, type StoredPhoto } from "./photoStore";

export type QueuedAscentStatus = "pending" | "rejected";

export interface QueuedPeak {
  name: string;
  altitudeMeters: number;
}

export interface QueuedAscent {
  clientAscentId: string;
  request: RegisterAscentRequest;
  peak: QueuedPeak;
  queuedAtUtc: string;
  photos: StoredPhoto[];
  droppedPhotos: number;
  status: QueuedAscentStatus;
  attempts: number;
  lastErrorCode?: string;
}

interface OfflineQueueState {
  entries: QueuedAscent[];
}

export const offlineQueueKey = "peaker-offline-ascents";

export const useOfflineQueue = createPersistedStore<OfflineQueueState>(
  offlineQueueKey,
  { entries: [] },
);

const replaceEntries = (
  update: (entries: readonly QueuedAscent[]) => QueuedAscent[],
): void =>
  useOfflineQueue.setState({
    entries: update(useOfflineQueue.getState().entries),
  });

const patch = (
  clientAscentId: string,
  changes: Partial<QueuedAscent>,
): void =>
  replaceEntries((entries) =>
    entries.map((entry) =>
      entry.clientAscentId === clientAscentId ? { ...entry, ...changes } : entry,
    ),
  );

export const queuedAscents = (): readonly QueuedAscent[] =>
  useOfflineQueue.getState().entries;

export const findQueuedAscent = (
  clientAscentId: string,
): QueuedAscent | undefined =>
  queuedAscents().find((entry) => entry.clientAscentId === clientAscentId);

export const enqueueAscent = (entry: QueuedAscent): void =>
  replaceEntries((entries) => [...entries, entry]);

export const dropQueuedAscent = (clientAscentId: string): void =>
  replaceEntries((entries) =>
    entries.filter((entry) => entry.clientAscentId !== clientAscentId),
  );

export const discardQueuedAscent = async (
  clientAscentId: string,
): Promise<void> => {
  const entry = findQueuedAscent(clientAscentId);

  if (entry) {
    await deletePhotos(entry.photos);
  }

  dropQueuedAscent(clientAscentId);
};

export const markAttempted = (clientAscentId: string): void =>
  patch(clientAscentId, {
    attempts: (findQueuedAscent(clientAscentId)?.attempts ?? 0) + 1,
  });

export const markRejected = (
  clientAscentId: string,
  lastErrorCode: string,
): void => patch(clientAscentId, { status: "rejected", lastErrorCode });
