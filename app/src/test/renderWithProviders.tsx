import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { IntlProvider } from "use-intl";
import { defaultLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/test/dictionaries";

export interface ProviderOptions {
  locale?: Locale;
  route?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: ProviderOptions = {},
): RenderResult => {
  const { locale = defaultLocale, route = "/" } = options;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale={locale} messages={dictionaries[locale]} timeZone="UTC">
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>
  );

  return render(ui, { wrapper: Wrapper });
};
