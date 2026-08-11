import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { PhotoCandidate } from "@/lib/ascents/photos";
import type { RegisterAscentRequest } from "@/types/api";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

const writeFile = vi.fn();

vi.mock("@capacitor/filesystem", () => ({
  Directory: { Data: "DATA" },
  Filesystem: {
    writeFile: (options: unknown) => writeFile(options),
    readFile: () => Promise.resolve({ data: "AQID" }),
    deleteFile: () => Promise.resolve(),
  },
}));

const submitAscent = vi.fn();

vi.mock("@/lib/ascents/submitAscent", () => ({
  submitAscent: (options: unknown) => submitAscent(options),
}));

const { submitOrQueue } = await import("./submitOrQueue");
const { queuedAscents, useOfflineQueue } = await import("./queue");

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

const peak = { name: "Aneto", altitudeMeters: 3404 };

const photo = (name: string): PhotoCandidate => ({
  id: name,
  file: new File([new Uint8Array([1])], name, { type: "image/jpeg" }),
  previewUrl: `blob:${name}`,
});

const submit = (photos: PhotoCandidate[] = []) =>
  submitOrQueue({ request, photos, peak });

beforeEach(() => {
  vi.resetAllMocks();
  writeFile.mockResolvedValue(undefined);
  useOfflineQueue.setState({ entries: [] });
});

describe("submitOrQueue", () => {
  it("submitOrQueue_withNetwork_sendsAndDoesNotQueue", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });

    await expect(submit()).resolves.toEqual({
      status: "submitted",
      ascentId: "server-id",
      failedPhotos: 0,
    });
    expect(queuedAscents()).toHaveLength(0);
  });

  it("submitOrQueue_always_stampsAClientAscentIdOnTheRequest", async () => {
    submitAscent.mockResolvedValue({ ascentId: "server-id", failedPhotos: 0 });

    await submit();

    const [{ request: sent }] = submitAscent.mock.calls[0] as [
      { request: RegisterAscentRequest },
    ];

    expect(sent.clientAscentId).toEqual(expect.any(String));
  });

  it("submitOrQueue_withoutNetwork_queuesTheAscent", async () => {
    submitAscent.mockRejectedValue(new TypeError("Failed to fetch"));

    const outcome = await submit();

    expect(outcome.status).toBe("queued");
    expect(queuedAscents()).toHaveLength(1);
  });

  it("submitOrQueue_withoutNetwork_queuesTheSameKeyItTriedToSend", async () => {
    submitAscent.mockRejectedValue(new TypeError("Failed to fetch"));

    const outcome = await submit();
    const entry = queuedAscents().at(0);

    expect(outcome).toMatchObject({ clientAscentId: entry?.clientAscentId });
    expect(entry?.request.clientAscentId).toBe(entry?.clientAscentId);
  });

  it("submitOrQueue_withoutNetwork_keepsThePhotoBytesOnDisk", async () => {
    submitAscent.mockRejectedValue(new TypeError("Failed to fetch"));

    const outcome = await submit([photo("a.jpg"), photo("b.jpg")]);

    expect(outcome).toMatchObject({
      status: "queued",
      keptPhotos: 2,
      droppedPhotos: 0,
    });
    expect(queuedAscents().at(0)?.photos).toHaveLength(2);
    expect(writeFile).toHaveBeenCalledTimes(2);
  });

  it("submitOrQueue_aFailingWrite_queuesTheAscentAnyway", async () => {
    submitAscent.mockRejectedValue(new TypeError("Failed to fetch"));
    writeFile.mockRejectedValue(new Error("no space"));

    const outcome = await submit([photo("a.jpg")]);

    expect(outcome).toMatchObject({
      status: "queued",
      keptPhotos: 0,
      droppedPhotos: 1,
    });
    expect(queuedAscents()).toHaveLength(1);
  });

  it("submitOrQueue_businessFailure_propagatesInsteadOfQueueing", async () => {
    submitAscent.mockRejectedValue(
      new ApiError({ status: 403, title: "Ascent.EmailNotConfirmed" }),
    );

    await expect(submit()).rejects.toBeInstanceOf(ApiError);
    expect(queuedAscents()).toHaveLength(0);
  });
});
