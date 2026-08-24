import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { RegisterAscentRequest } from "@/types/api";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

const deleteFile = vi.fn();

vi.mock("@capacitor/filesystem", () => ({
  Directory: { Data: "DATA" },
  Filesystem: {
    writeFile: () => Promise.resolve(),
    readFile: () => Promise.resolve({ data: "AQID" }),
    deleteFile: (options: unknown) => deleteFile(options),
  },
}));

const submitAscent = vi.fn();

vi.mock("@/lib/ascents/submitAscent", () => ({
  submitAscent: (options: unknown) => submitAscent(options),
}));

const sessionStatus = vi.fn(() => "authenticated");

vi.mock("@/lib/auth/sessionStore", () => ({
  getSessionState: () => ({ status: sessionStatus(), session: undefined }),
}));

const invalidateQueries = vi.fn();

vi.mock("@/lib/queryClient", () => ({
  ownerScopes: ["ascent", "ascents", "profile", "collections"],
  queryClient: {
    invalidateQueries: (filters: unknown) => invalidateQueries(filters),
  },
}));

const { syncQueuedAscents } = await import("./sync");
const { enqueueAscent, queuedAscents, useOfflineQueue } = await import(
  "./queue"
);

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

const queue = (...ids: string[]) => {
  for (const clientAscentId of ids) {
    enqueueAscent({
      clientAscentId,
      request: { ...request, clientAscentId },
      peak: { name: "Aneto", altitudeMeters: 3404 },
      queuedAtUtc: "2026-08-08T10:00:00.000Z",
      photos: [],
      droppedPhotos: 0,
      status: "pending",
      attempts: 0,
    });
  }
};

const queueWithPhotos = (
  clientAscentId: string,
  photos: { path: string; name: string; type: string }[],
) => {
  enqueueAscent({
    clientAscentId,
    request: { ...request, clientAscentId },
    peak: { name: "Aneto", altitudeMeters: 3404 },
    queuedAtUtc: "2026-08-08T10:00:00.000Z",
    photos,
    droppedPhotos: 0,
    status: "pending",
    attempts: 0,
  });
};

beforeEach(() => {
  vi.resetAllMocks();
  deleteFile.mockResolvedValue(undefined);
  sessionStatus.mockReturnValue("authenticated");
  useOfflineQueue.setState({ entries: [] });
});

describe("syncQueuedAscents", () => {
  it("sync_pendingEntry_replaysItWithTheStoredClientAscentId", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });
    queue("key-1");

    await syncQueuedAscents();

    const [{ request: sent }] = submitAscent.mock.calls[0] as [
      { request: RegisterAscentRequest },
    ];

    expect(sent.clientAscentId).toBe("key-1");
  });

  it("sync_successfulReplay_leavesTheQueueEmpty", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });
    queue("key-1", "key-2");

    await syncQueuedAscents();

    expect(queuedAscents()).toHaveLength(0);
    expect(submitAscent).toHaveBeenCalledTimes(2);
  });

  it("sync_successfulReplay_invalidatesTheOwnerScopes", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });
    queue("key-1");

    await syncQueuedAscents();

    expect(invalidateQueries).toHaveBeenCalledTimes(4);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["ascents"] });
  });

  it("sync_stillOffline_keepsTheEntryAndStopsTheDrain", async () => {
    submitAscent.mockRejectedValue(new TypeError("Failed to fetch"));
    queue("key-1", "key-2");

    await syncQueuedAscents();

    expect(queuedAscents()).toHaveLength(2);
    expect(submitAscent).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("sync_serverError_isTreatedAsRetryableAndKeepsTheEntry", async () => {
    submitAscent.mockRejectedValue(new ApiError({ status: 503 }));
    queue("key-1");

    await syncQueuedAscents();

    expect(queuedAscents().at(0)?.status).toBe("pending");
  });

  it("sync_businessRejection_marksTheEntryAndCarriesOn", async () => {
    submitAscent
      .mockRejectedValueOnce(
        new ApiError({ status: 404, title: "Ascent.PeakNotFound" }),
      )
      .mockResolvedValueOnce({ ascentId: "server-id", failedPhotos: 0 });
    queue("key-1", "key-2");

    await syncQueuedAscents();

    expect(queuedAscents()).toEqual([
      expect.objectContaining({
        clientAscentId: "key-1",
        status: "rejected",
        lastErrorCode: "Ascent.PeakNotFound",
      }),
    ]);
  });

  it("sync_rejectedEntry_isNotReplayedAgain", async () => {
    submitAscent.mockRejectedValue(
      new ApiError({ status: 400, title: "Ascent.DateInFuture" }),
    );
    queue("key-1");

    await syncQueuedAscents();
    await syncQueuedAscents();

    expect(submitAscent).toHaveBeenCalledTimes(1);
  });

  it("sync_withoutASession_doesNotTouchTheQueue", async () => {
    sessionStatus.mockReturnValue("anonymous");
    queue("key-1");

    await syncQueuedAscents();

    expect(submitAscent).not.toHaveBeenCalled();
    expect(queuedAscents().at(0)?.status).toBe("pending");
  });

  it("sync_calledTwiceAtOnce_drainsTheQueueOnlyOnce", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });
    queue("key-1");

    await Promise.all([syncQueuedAscents(), syncQueuedAscents()]);

    expect(submitAscent).toHaveBeenCalledTimes(1);
  });

  it("sync_entryWithStoredPhotos_uploadsThemWithTheAscent", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });
    queueWithPhotos("key-1", [
      { path: "peaker-offline-key-1-0", name: "a.jpg", type: "image/jpeg" },
    ]);

    await syncQueuedAscents();

    const [{ photos }] = submitAscent.mock.calls[0] as [
      { photos: { file: File }[] },
    ];

    expect(photos).toHaveLength(1);
    expect(photos[0]?.file.name).toBe("a.jpg");
  });

  it("sync_successfulReplay_deletesThePhotosFromDisk", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });
    queueWithPhotos("key-1", [
      { path: "peaker-offline-key-1-0", name: "a.jpg", type: "image/jpeg" },
    ]);

    await syncQueuedAscents();

    expect(deleteFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: "peaker-offline-key-1-0" }),
    );
  });

  it("sync_stillOffline_keepsThePhotosOnDisk", async () => {
    submitAscent.mockRejectedValue(new TypeError("Failed to fetch"));
    queueWithPhotos("key-1", [
      { path: "peaker-offline-key-1-0", name: "a.jpg", type: "image/jpeg" },
    ]);

    await syncQueuedAscents();

    expect(deleteFile).not.toHaveBeenCalled();
    expect(queuedAscents().at(0)?.photos).toHaveLength(1);
  });

  it("sync_everyReplay_countsAsAnAttempt", async () => {
    submitAscent.mockRejectedValue(new ApiError({ status: 503 }));
    queue("key-1");

    await syncQueuedAscents();
    await syncQueuedAscents();

    expect(queuedAscents().at(0)?.attempts).toBe(2);
  });
});
