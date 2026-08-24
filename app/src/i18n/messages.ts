import type { Locale } from "./config";

const loadEnglish = () => import("../../messages/en.json");

export type Messages = Awaited<ReturnType<typeof loadEnglish>>["default"] &
  Awaited<ReturnType<typeof loadEnglishLegal>>["default"];

const loadEnglishLegal = () => import("../../messages/legal/en.json");

const loaders: Record<Locale, () => Promise<{ default: unknown }>> = {
  en: loadEnglish,
  es: () => import("../../messages/es.json"),
  zh: () => import("../../messages/zh.json"),
  fr: () => import("../../messages/fr.json"),
  ar: () => import("../../messages/ar.json"),
};

const legalLoaders: Record<Locale, () => Promise<{ default: unknown }>> = {
  en: loadEnglishLegal,
  es: () => import("../../messages/legal/es.json"),
  zh: () => import("../../messages/legal/zh.json"),
  fr: () => import("../../messages/legal/fr.json"),
  ar: () => import("../../messages/legal/ar.json"),
};

export const loadMessages = async (locale: Locale): Promise<Messages> => {
  const [messages, legal] = await Promise.all([
    loaders[locale](),
    legalLoaders[locale](),
  ]);

  return { ...(messages.default as object), ...(legal.default as object) } as Messages;
};
