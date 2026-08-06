import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { queryClient } from "@/lib/queryClient";

export const Providers = ({ children }: { children: ReactNode }) => (
  <LocaleProvider>
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-center" closeButton />
    </QueryClientProvider>
  </LocaleProvider>
);
