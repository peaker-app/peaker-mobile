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
import { loadMessages, type Messages } from "./messages";

export interface LocaleSetting {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

interface ActiveLocale {
  locale: Locale;
  messages: Messages;
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

const activate = async (locale: Locale): Promise<ActiveLocale> => ({
  locale,
  messages: await loadMessages(locale),
});

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<ActiveLocale>();

  useEffect(() => {
    void resolveInitialLocale().then(activate).then(setActive);
  }, []);

  useEffect(() => {
    if (active) {
      applyDocumentDirection(active.locale);
    }
  }, [active]);

  const setLocale = useCallback((next: Locale) => {
    void activate(next).then(setActive);
    void storeLocale(next);
  }, []);

  if (!active) {
    return null;
  }

  return (
    <LocaleContext value={{ locale: active.locale, setLocale }}>
      <IntlProvider
        locale={active.locale}
        messages={active.messages}
        timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      >
        {children}
      </IntlProvider>
    </LocaleContext>
  );
};
