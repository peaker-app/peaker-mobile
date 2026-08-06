import type { CollectionKind, CollectionSummaryResponse } from "@/types/api";

export const collectionNameMaxLength = 60;
export const collectionDescriptionMaxLength = 500;

export const isDefaultCollection = (kind: CollectionKind): boolean =>
  kind === "WantToClimb";

export const collectionLabel = (
  collection: Pick<CollectionSummaryResponse, "name" | "kind">,
  defaultName: string,
): string => (isDefaultCollection(collection.kind) ? defaultName : collection.name);

export const isValidCollectionName = (value: string): boolean => {
  const trimmed = value.trim();

  return trimmed.length > 0 && trimmed.length <= collectionNameMaxLength;
};

export const isValidCollectionDescription = (value: string): boolean =>
  value.trim().length <= collectionDescriptionMaxLength;
