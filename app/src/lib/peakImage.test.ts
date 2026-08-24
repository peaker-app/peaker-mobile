import { describe, expect, it } from "vitest";
import { peakThumbnail } from "./peakImage";

const commons =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Aneto%20south.jpg";

describe("peakThumbnail", () => {
  it("peakThumbnail_commonsFilePath_asksForAThumbnailOfTheGivenWidth", () => {
    expect(peakThumbnail(commons, 128)).toBe(`${commons}?width=128`);
  });

  it("peakThumbnail_foreignHost_isLeftUntouched", () => {
    const cloudinary = "https://res.cloudinary.com/demo/photo.jpg";

    expect(peakThumbnail(cloudinary, 128)).toBe(cloudinary);
  });

  it("peakThumbnail_commonsUrlOutsideFilePath_isLeftUntouched", () => {
    const article = "https://commons.wikimedia.org/wiki/File:Aneto.jpg";

    expect(peakThumbnail(article, 128)).toBe(article);
  });
});
