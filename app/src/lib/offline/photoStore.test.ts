import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PhotoCandidate } from "@/lib/ascents/photos";

const writeFile = vi.fn();
const readFile = vi.fn();
const deleteFile = vi.fn();

vi.mock("@capacitor/filesystem", () => ({
  Directory: { Data: "DATA" },
  Filesystem: {
    writeFile: (options: unknown) => writeFile(options),
    readFile: (options: unknown) => readFile(options),
    deleteFile: (options: unknown) => deleteFile(options),
  },
}));

const { deletePhotos, readPhotos, savePhotos } = await import("./photoStore");

const candidate = (name: string, bytes = [1, 2, 3]): PhotoCandidate => ({
  id: name,
  file: new File([new Uint8Array(bytes)], name, { type: "image/jpeg" }),
  previewUrl: `blob:${name}`,
});

beforeEach(() => {
  vi.resetAllMocks();
  writeFile.mockResolvedValue(undefined);
  readFile.mockResolvedValue({ data: "AQID" });
  deleteFile.mockResolvedValue(undefined);
});

describe("savePhotos", () => {
  it("savePhotos_everyPhoto_writesItUnderAPathDerivedFromTheKey", async () => {
    const { stored, dropped } = await savePhotos("key-1", [
      candidate("a.jpg"),
      candidate("b.jpg"),
    ]);

    expect(stored.map((photo) => photo.path)).toEqual([
      "peaker-offline-key-1-0",
      "peaker-offline-key-1-1",
    ]);
    expect(dropped).toBe(0);
  });

  it("savePhotos_always_keepsTheNameAndTypeNeededToRebuildTheFile", async () => {
    const { stored } = await savePhotos("key-1", [candidate("cumbre.jpg")]);

    expect(stored[0]).toMatchObject({
      name: "cumbre.jpg",
      type: "image/jpeg",
    });
  });

  it("savePhotos_always_writesBase64WithoutTheDataUrlPrefix", async () => {
    await savePhotos("key-1", [candidate("a.jpg", [1, 2, 3])]);

    const [options] = writeFile.mock.calls[0] as [{ data: string }];

    expect(options.data).toBe("AQID");
  });

  it("savePhotos_aFailingWrite_countsAsDroppedInsteadOfLosingTheAscent", async () => {
    writeFile
      .mockRejectedValueOnce(new Error("no space"))
      .mockResolvedValueOnce(undefined);

    const { stored, dropped } = await savePhotos("key-1", [
      candidate("a.jpg"),
      candidate("b.jpg"),
    ]);

    expect(stored).toHaveLength(1);
    expect(dropped).toBe(1);
  });
});

describe("readPhotos", () => {
  it("readPhotos_storedPhoto_rebuildsAFileWithItsNameAndType", async () => {
    const [photo] = await readPhotos([
      { path: "peaker-offline-key-1-0", name: "cumbre.jpg", type: "image/jpeg" },
    ]);

    expect(photo?.file.name).toBe("cumbre.jpg");
    expect(photo?.file.type).toBe("image/jpeg");
    expect(photo?.file.size).toBe(3);
  });

  it("readPhotos_storedPhoto_givesItAFreshPreviewUrl", async () => {
    const [photo] = await readPhotos([
      { path: "peaker-offline-key-1-0", name: "a.jpg", type: "image/jpeg" },
    ]);

    expect(photo?.previewUrl).toMatch(/^blob:/);
  });

  it("readPhotos_aMissingFile_isSkippedInsteadOfFailingTheReplay", async () => {
    readFile
      .mockRejectedValueOnce(new Error("not found"))
      .mockResolvedValueOnce({ data: "AQID" });

    const photos = await readPhotos([
      { path: "gone", name: "a.jpg", type: "image/jpeg" },
      { path: "here", name: "b.jpg", type: "image/jpeg" },
    ]);

    expect(photos.map((photo) => photo.file.name)).toEqual(["b.jpg"]);
  });

  it("readPhotos_aBlobInsteadOfBase64_isSkipped", async () => {
    readFile.mockResolvedValue({ data: new Blob() });

    const photos = await readPhotos([
      { path: "weird", name: "a.jpg", type: "image/jpeg" },
    ]);

    expect(photos).toHaveLength(0);
  });
});

describe("deletePhotos", () => {
  it("deletePhotos_everyStoredPhoto_isRemovedFromDisk", async () => {
    await deletePhotos([
      { path: "one", name: "a.jpg", type: "image/jpeg" },
      { path: "two", name: "b.jpg", type: "image/jpeg" },
    ]);

    expect(deleteFile).toHaveBeenCalledTimes(2);
  });

  it("deletePhotos_aFailingDelete_isSwallowed", async () => {
    deleteFile.mockRejectedValue(new Error("locked"));

    await expect(
      deletePhotos([{ path: "one", name: "a.jpg", type: "image/jpeg" }]),
    ).resolves.toBeUndefined();
  });
});
