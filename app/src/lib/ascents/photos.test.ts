import { describe, expect, it } from "vitest";
import {
  maxPhotoBytes,
  maxPhotos,
  movePhoto,
  selectPhotos,
  type PhotoCandidate,
} from "./photos";

const preview = (file: File) => `blob:${file.name}`;

const file = (name: string, type = "image/jpeg", size = 1024): File => {
  const blob = new File(["x"], name, { type });
  Object.defineProperty(blob, "size", { value: size });

  return blob;
};

const candidate = (name: string): PhotoCandidate => ({
  id: name,
  file: file(name),
  previewUrl: `blob:${name}`,
});

describe("selectPhotos", () => {
  it("selectPhotos_supportedImages_areAccepted", () => {
    const result = selectPhotos(
      [],
      [file("a.jpg"), file("b.png", "image/png"), file("c.webp", "image/webp")],
      preview,
    );

    expect(result.accepted).toHaveLength(3);
    expect(result.rejected).toHaveLength(0);
  });

  it("selectPhotos_unsupportedType_isRejected", () => {
    const result = selectPhotos([], [file("a.gif", "image/gif")], preview);

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected[0]).toEqual({ name: "a.gif", reason: "unsupported" });
  });

  it("selectPhotos_overTenMegabytes_isRejected", () => {
    const result = selectPhotos(
      [],
      [file("big.jpg", "image/jpeg", maxPhotoBytes + 1)],
      preview,
    );

    expect(result.rejected[0]?.reason).toBe("tooLarge");
  });

  it("selectPhotos_exactlyTenMegabytes_isAccepted", () => {
    const result = selectPhotos(
      [],
      [file("edge.jpg", "image/jpeg", maxPhotoBytes)],
      preview,
    );

    expect(result.accepted).toHaveLength(1);
  });

  it("selectPhotos_beyondTheThreePhotoLimit_isRejected", () => {
    const result = selectPhotos(
      [],
      [file("a.jpg"), file("b.jpg"), file("c.jpg"), file("d.jpg")],
      preview,
    );

    expect(result.accepted).toHaveLength(maxPhotos);
    expect(result.rejected[0]?.reason).toBe("tooMany");
  });

  it("selectPhotos_countsThePhotosAlreadyChosen", () => {
    const result = selectPhotos(
      [candidate("a.jpg"), candidate("b.jpg")],
      [file("c.jpg"), file("d.jpg")],
      preview,
    );

    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
  });
});

describe("movePhoto", () => {
  const photos = ["a", "b", "c"];

  it("movePhoto_forward_swapsTheOrder", () => {
    expect(movePhoto(photos, 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("movePhoto_backward_swapsTheOrder", () => {
    expect(movePhoto(photos, 2, 1)).toEqual(["a", "c", "b"]);
  });

  it("movePhoto_beyondTheEdges_leavesItUnchanged", () => {
    expect(movePhoto(photos, 0, -1)).toEqual(photos);
    expect(movePhoto(photos, 2, 3)).toEqual(photos);
  });
});
