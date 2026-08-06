import type { Locale } from "@/i18n/config";

const metersInKilometer = 1000;
const coordinateFractionDigits = 5;

const latinDigitsLocale = (locale: Locale): string =>
  locale === "ar" ? "ar-u-nu-latn" : locale;

export const formatAltitude = (locale: Locale, meters: number): string =>
  new Intl.NumberFormat(latinDigitsLocale(locale)).format(meters);

export const formatCoordinate = (locale: Locale, value: number): string =>
  new Intl.NumberFormat(latinDigitsLocale(locale), {
    minimumFractionDigits: coordinateFractionDigits,
    maximumFractionDigits: coordinateFractionDigits,
  }).format(value);

export interface FormattedDistance {
  unit: "meters" | "kilometers";
  value: string;
}

export const formatDistance = (
  locale: Locale,
  meters: number,
): FormattedDistance =>
  meters < metersInKilometer
    ? {
        unit: "meters",
        value: new Intl.NumberFormat(latinDigitsLocale(locale), {
          maximumFractionDigits: 0,
        }).format(meters),
      }
    : {
        unit: "kilometers",
        value: new Intl.NumberFormat(latinDigitsLocale(locale), {
          maximumFractionDigits: 1,
        }).format(meters / metersInKilometer),
      };

export const parseDateOnly = (value: string): Date | undefined => {
  const parts = value.split("-").map(Number);
  const [year, month, day] = parts;

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return undefined;
  }

  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
};

export const toDateOnly = (date: Date): string => {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const todayAsDateOnly = (): string => toDateOnly(new Date());
