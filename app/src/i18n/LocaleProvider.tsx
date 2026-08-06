import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { IntlProvider } from "use-intl";
import { getDirection, type Locale } from "./config";
import { resolveInitialLocale, storeLocale } from "./locale";
import { messages } from "./messages";

export interface LocaleSetting {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleSetting | undefined>(undefined);

export const useLocaleSetting = (): LocaleSetting => {
  const setting = use(LocaleContext);

  if (!setting) {
    throw new Error("useLocaleSetting must be used inside a LocaleProvider");
  }

  return setting;
};

const applyDocumentDirection = (locale: Locale): void => {
  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setResolved] = useState<Locale>();

  useEffect(() => {
    void resolveInitialLocale().then(setResolved);
  }, []);

  useEffect(() => {
    if (locale) {
      applyDocumentDirection(locale);
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setResolved(next);
    void storeLocale(next);
  }, []);

  if (!locale) {
    return null;
  }

  return (
    <LocaleContext value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        messages={messages[locale]}
        timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      >
        {children}
      </IntlProvider>
    </LocaleContext>
  );
};
