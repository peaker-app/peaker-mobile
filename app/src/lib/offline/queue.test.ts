import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RegisterAscentRequest } from "@/types/api";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

vi.mock("@capacitor/filesystem", () => ({
  Directory: { Data: "DATA" },
  Filesystem: {
    writeFile: () => Promise.resolve(),
    readFile: () => Promise.resolve({ data: "AAEC" }),
    deleteFile: () => Promise.resolve(),
  },
}));

const {
  dropQueuedAscent,
  enqueueAscent,
  findQueuedAscent,
  markAttempted,
  markRejected,
  queuedAscents,
  useOfflineQueue,
} = await import("./queue");

const request: RegisterAscentRequest = {
  peakId: "0198f000-0000-7000-8000-0000000000a1",
  ascentDate: "2026-07-01",
  companions: null,
  routeNotes: null,
  snow: null,
  wind: null,
  trail: null,
  visibility: "Public",
};

const queued = (clientAscentId: string) => ({
  clientAscentId,
  request: { ...request, clientAscentId },
  peak: { name: "Aneto", altitudeMeters: 3404 },
  queuedAtUtc: "2026-08-08T10:00:00.000Z",
  photos: [],
  droppedPhotos: 0,
  status: "pending" as const,
  attempts: 0,
});

beforeEach(() => {
  useOfflineQueue.setState({ entries: [] });
});

describe("offline queue", () => {
  it("queue_enqueue_keepsTheArrivalOrder", () => {
    enqueueAscent(queued("first"));
    enqueueAscent(queued("second"));

    expect(queuedAscents().map((entry) => entry.clientAscentId)).toEqual([
      "first",
      "second",
    ]);
  });

  it("queue_findQueuedAscent_returnsTheMatchingEntry", () => {
    enqueueAscent(queued("first"));

    expect(findQueuedAscent("first")?.peak.name).toBe("Aneto");
    expect(findQueuedAscent("missing")).toBeUndefined();
  });

  it("queue_drop_removesOnlyThatEntry", () => {
    enqueueAscent(queued("first"));
    enqueueAscent(queued("second"));

    dropQueuedAscent("first");

    expect(queuedAscents().map((entry) => entry.clientAscentId)).toEqual([
      "second",
    ]);
  });

  it("queue_markAttempted_countsEveryReplay", () => {
    enqueueAscent(queued("first"));

    markAttempted("first");
    markAttempted("first");

    expect(findQueuedAscent("first")?.attempts).toBe(2);
  });

  it("queue_markRejected_recordsTheCodeAndStopsBeingPending", () => {
    enqueueAscent(queued("first"));

    markRejected("first", "Ascent.PeakNotFound");

    expect(findQueuedAscent("first")).toMatchObject({
      status: "rejected",
      lastErrorCode: "Ascent.PeakNotFound",
    });
  });

  it("queue_markRejected_leavesTheOtherEntriesUntouched", () => {
    enqueueAscent(queued("first"));
    enqueueAscent(queued("second"));

    markRejected("first", "Ascent.DateInFuture");

    expect(findQueuedAscent("second")?.status).toBe("pending");
  });
});
