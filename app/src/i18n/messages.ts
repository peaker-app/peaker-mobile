import type { Locale } from "./config";

const loadEnglish = () => import("../../messages/en.json");

export type Messages = Awaited<ReturnType<typeof loadEnglish>>["default"];

const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: loadEnglish,
  es: () => import("../../messages/es.json"),
  zh: () => import("../../messages/zh.json"),
  fr: () => import("../../messages/fr.json"),
  ar: () => import("../../messages/ar.json"),
};

export const loadMessages = async (locale: Locale): Promise<Messages> =>
  (await loaders[locale]()).default;
