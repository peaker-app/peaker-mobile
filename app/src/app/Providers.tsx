import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { persistOptions } from "@/lib/offline/persister";
import { queryClient } from "@/lib/queryClient";

export const Providers = ({ children }: { children: ReactNode }) => (
  <LocaleProvider>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      {children}
      <Toaster position="bottom-center" closeButton />
    </PersistQueryClientProvider>
  </LocaleProvider>
);
