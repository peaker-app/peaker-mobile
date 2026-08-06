export const locales = ["en", "es", "zh", "fr", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const rtlLocales: readonly Locale[] = ["ar"];

export const getDirection = (locale: Locale): "ltr" | "rtl" =>
  rtlLocales.includes(locale) ? "rtl" : "ltr";

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);
