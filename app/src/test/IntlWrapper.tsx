import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";
import zh from "../../messages/zh.json";
import legalAr from "../../messages/legal/ar.json";
import legalEn from "../../messages/legal/en.json";
import legalEs from "../../messages/legal/es.json";
import legalFr from "../../messages/legal/fr.json";
import legalZh from "../../messages/legal/zh.json";
import { defaultLocale, type Locale } from "@/i18n/config";

type Dictionary = typeof en & typeof legalEn;

const interfaceMessages: Record<Locale, typeof en> = { en, es, zh, fr, ar };

const legalMessages: Record<Locale, typeof legalEn> = {
  en: legalEn,
  es: legalEs,
  zh: legalZh,
  fr: legalFr,
  ar: legalAr,
};

const cache = new Map<Locale, Dictionary>();

const dictionaryFor = (locale: Locale): Dictionary => {
  const cached = cache.get(locale);

  if (cached) {
    return cached;
  }

  const merged = {
    ...interfaceMessages[locale],
    ...legalMessages[locale],
  } as Dictionary;
  cache.set(locale, merged);

  return merged;
};

export interface IntlWrapperProps {
  children: ReactNode;
  locale?: Locale;
}

export const IntlWrapper = ({
  children,
  locale = defaultLocale,
}: IntlWrapperProps) => (
  <NextIntlClientProvider locale={locale} messages={dictionaryFor(locale)}>
    {children}
  </NextIntlClientProvider>
);
