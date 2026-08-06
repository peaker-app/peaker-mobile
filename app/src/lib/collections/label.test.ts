import { describe, expect, it } from "vitest";
import {
  collectionDescriptionMaxLength,
  collectionLabel,
  collectionNameMaxLength,
  isDefaultCollection,
  isValidCollectionDescription,
  isValidCollectionName,
} from "./label";

describe("isDefaultCollection", () => {
  it("isDefaultCollection_wantToClimb_isTheDefaultOne", () => {
    expect(isDefaultCollection("WantToClimb")).toBe(true);
  });

  it("isDefaultCollection_custom_isNot", () => {
    expect(isDefaultCollection("Custom")).toBe(false);
  });
});

describe("collectionLabel", () => {
  it("collectionLabel_default_usesTheTranslationNotTheStoredName", () => {
    const label = collectionLabel(
      { name: "Want to climb", kind: "WantToClimb" },
      "Quiero subir",
    );

    expect(label).toBe("Quiero subir");
  });

  it("collectionLabel_customNamedLikeTheDefault_keepsItsOwnName", () => {
    const label = collectionLabel(
      { name: "Want to climb", kind: "Custom" },
      "Quiero subir",
    );

    expect(label).toBe("Want to climb");
  });

  it("collectionLabel_custom_usesItsName", () => {
    expect(collectionLabel({ name: "Tresmiles", kind: "Custom" }, "Quiero subir")).toBe(
      "Tresmiles",
    );
  });
});

describe("isValidCollectionName", () => {
  it("isValidCollectionName_plainName_isAccepted", () => {
    expect(isValidCollectionName("Tresmiles")).toBe(true);
  });

  it.each(["", "   "])("isValidCollectionName_blank_isRejected", (value) => {
    expect(isValidCollectionName(value)).toBe(false);
  });

  it("isValidCollectionName_atTheLimit_isAccepted", () => {
    expect(isValidCollectionName("a".repeat(collectionNameMaxLength))).toBe(true);
  });

  it("isValidCollectionName_overTheLimit_isRejected", () => {
    expect(isValidCollectionName("a".repeat(collectionNameMaxLength + 1))).toBe(false);
  });

  it("isValidCollectionName_paddedButLongEnough_isAcceptedBecauseItIsTrimmed", () => {
    expect(isValidCollectionName(`  ${"a".repeat(collectionNameMaxLength)}  `)).toBe(true);
  });
});

describe("isValidCollectionDescription", () => {
  it("isValidCollectionDescription_empty_isAcceptedBecauseItIsOptional", () => {
    expect(isValidCollectionDescription("")).toBe(true);
  });

  it("isValidCollectionDescription_atTheLimit_isAccepted", () => {
    expect(
      isValidCollectionDescription("a".repeat(collectionDescriptionMaxLength)),
    ).toBe(true);
  });

  it("isValidCollectionDescription_overTheLimit_isRejected", () => {
    expect(
      isValidCollectionDescription("a".repeat(collectionDescriptionMaxLength + 1)),
    ).toBe(false);
  });
});
