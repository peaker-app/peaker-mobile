import { Device } from "@capacitor/device";
import { Preferences } from "@capacitor/preferences";
import { defaultLocale, isLocale, type Locale } from "./config";

export const localePreferenceKey = "locale";

export const readStoredLocale = async (): Promise<Locale | undefined> => {
  const { value } = await Preferences.get({ key: localePreferenceKey });

  return value && isLocale(value) ? value : undefined;
};

export const storeLocale = (locale: Locale): Promise<void> =>
  Preferences.set({ key: localePreferenceKey, value: locale });

export const detectDeviceLocale = async (): Promise<Locale | undefined> => {
  const { value } = await Device.getLanguageCode();

  return isLocale(value) ? value : undefined;
};

export const resolveInitialLocale = async (): Promise<Locale> =>
  (await readStoredLocale()) ?? (await detectDeviceLocale()) ?? defaultLocale;
