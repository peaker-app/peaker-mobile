import { describe, expect, it } from "vitest";
import {
  bioMaxLength,
  displayNameMaxLength,
  initialsOf,
  isValidBio,
  isValidDisplayName,
  isValidSlug,
  maxAvatarBytes,
  rejectAvatar,
  slugMaxLength,
} from "./avatar";

const file = (type: string, size = 1024): File => {
  const blob = new File(["x"], "avatar", { type });
  Object.defineProperty(blob, "size", { value: size });

  return blob;
};

describe("rejectAvatar", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])(
    "rejectAvatar_%s_isAccepted",
    (type) => {
      expect(rejectAvatar(file(type))).toBeUndefined();
    },
  );

  it.each(["image/gif", "application/pdf", ""])(
    "rejectAvatar_unsupportedType_isRejected",
    (type) => {
      expect(rejectAvatar(file(type))).toBe("unsupported");
    },
  );

  it("rejectAvatar_overFiveMegabytes_isRejected", () => {
    expect(rejectAvatar(file("image/jpeg", maxAvatarBytes + 1))).toBe("tooLarge");
  });

  it("rejectAvatar_exactlyFiveMegabytes_isAccepted", () => {
    expect(rejectAvatar(file("image/jpeg", maxAvatarBytes))).toBeUndefined();
  });
});

describe("isValidSlug", () => {
  it.each(["ruben", "ruben-val", "a1", "pico-de-aneto-2"])(
    "isValidSlug_%s_isAccepted",
    (value) => {
      expect(isValidSlug(value)).toBe(true);
    },
  );

  it.each(["-ruben", "ruben-", "ruben--val", "Ruben", "rubén", "ruben val", "ruben_val", ""])(
    "isValidSlug_%s_isRejected",
    (value) => {
      expect(isValidSlug(value)).toBe(false);
    },
  );

  it("isValidSlug_overTheLimit_isRejected", () => {
    expect(isValidSlug("a".repeat(slugMaxLength + 1))).toBe(false);
  });
});

describe("isValidDisplayName", () => {
  it("isValidDisplayName_plainName_isAccepted", () => {
    expect(isValidDisplayName("Rubén Val")).toBe(true);
  });

  it.each(["", "   "])("isValidDisplayName_blank_isRejected", (value) => {
    expect(isValidDisplayName(value)).toBe(false);
  });

  it("isValidDisplayName_overSixtyCharacters_isRejected", () => {
    expect(isValidDisplayName("a".repeat(displayNameMaxLength + 1))).toBe(false);
  });
});

describe("isValidBio", () => {
  it("isValidBio_empty_isAcceptedBecauseItIsOptional", () => {
    expect(isValidBio("")).toBe(true);
  });

  it("isValidBio_atTheLimit_isAccepted", () => {
    expect(isValidBio("a".repeat(bioMaxLength))).toBe(true);
  });

  it("isValidBio_overTheLimit_isRejected", () => {
    expect(isValidBio("a".repeat(bioMaxLength + 1))).toBe(false);
  });
});

describe("initialsOf", () => {
  it("initialsOf_twoWords_takesBothInitials", () => {
    expect(initialsOf("Rubén Val")).toBe("RV");
  });

  it("initialsOf_manyWords_takesOnlyTheFirstTwo", () => {
    expect(initialsOf("Ana María López Ruiz")).toBe("AM");
  });

  it("initialsOf_singleWord_takesOneInitial", () => {
    expect(initialsOf("Ruben")).toBe("R");
  });
});
