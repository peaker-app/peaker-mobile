import type { Locale } from "@/i18n/config";
import type { PeakDetailResponse } from "@/types/api";

const wikidataIdPattern = /^Q[1-9][0-9]*$/;

export const isWikidataId = (name: string): boolean =>
  wikidataIdPattern.test(name);

export const peakDisplayName = (
  name: string,
  unnamed: (id: string) => string,
): string => (isWikidataId(name) ? unnamed(name) : name);

export const localizedPeakName = (
  peak: Pick<PeakDetailResponse, "name" | "alternativeNames">,
  locale: Locale,
): string =>
  peak.alternativeNames.find(
    (name) => name.languageCode === locale && name.isOfficial,
  )?.name ??
  peak.alternativeNames.find((name) => name.languageCode === locale)?.name ??
  peak.name;
