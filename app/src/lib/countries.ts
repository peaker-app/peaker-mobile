import type { Locale } from "@/i18n/config";

export const countryCodes: readonly string[] = [
  "AD", "AE", "AF", "AL", "AM", "AO", "AR", "AT", "AU", "AZ",
  "BA", "BD", "BE", "BF", "BG", "BI", "BJ", "BO", "BR", "BT",
  "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CL",
  "CM", "CN", "CO", "CR", "CU", "CY", "CZ", "DE", "DJ", "DK",
  "DO", "DZ", "EC", "EE", "EG", "ER", "ES", "ET", "FI", "FJ",
  "FR", "GA", "GB", "GE", "GH", "GL", "GN", "GQ", "GR", "GT",
  "GY", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IN", "IQ",
  "IR", "IS", "IT", "JM", "JO", "JP", "KE", "KG", "KH", "KP",
  "KR", "KZ", "LA", "LB", "LI", "LK", "LR", "LS", "LT", "LU",
  "LV", "LY", "MA", "MC", "MD", "ME", "MG", "MK", "ML", "MM",
  "MN", "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NI", "NL",
  "NO", "NP", "NZ", "OM", "PA", "PE", "PG", "PH", "PK", "PL",
  "PT", "PY", "RO", "RS", "RU", "RW", "SA", "SD", "SE", "SI",
  "SK", "SN", "SO", "SR", "SS", "SV", "SY", "TD", "TG", "TH",
  "TJ", "TM", "TN", "TR", "TW", "TZ", "UA", "UG", "US", "UY",
  "UZ", "VE", "VN", "YE", "ZA", "ZM", "ZW",
];

export interface CountryOption {
  code: string;
  label: string;
}

export const countryOptions = (locale: Locale): CountryOption[] => {
  const names = new Intl.DisplayNames([locale], { type: "region" });

  return countryCodes
    .map((code) => ({ code, label: names.of(code) ?? code }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
};

export const countryName = (locale: Locale, code: string): string =>
  new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;

export const isKnownCountry = (code: string): boolean =>
  countryCodes.includes(code);
