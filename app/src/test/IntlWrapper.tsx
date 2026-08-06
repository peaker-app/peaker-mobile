import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";
import zh from "../../messages/zh.json";
import { defaultLocale, type Locale } from "@/i18n/config";

const dictionaries: Record<Locale, typeof en> = { en, es, zh, fr, ar };

export interface IntlWrapperProps {
  children: ReactNode;
  locale?: Locale;
}

export const IntlWrapper = ({
  children,
  locale = defaultLocale,
}: IntlWrapperProps) => (
  <NextIntlClientProvider locale={locale} messages={dictionaries[locale]}>
    {children}
  </NextIntlClientProvider>
);
