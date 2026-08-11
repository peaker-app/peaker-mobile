import { Preferences } from "@capacitor/preferences";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";

export const queryCacheKey = "peaker-query-cache";

export const cacheMaxAge = 24 * 60 * 60 * 1000;

const storage = {
  getItem: async (key: string) => (await Preferences.get({ key })).value,
  setItem: (key: string, value: string) => Preferences.set({ key, value }),
  removeItem: (key: string) => Preferences.remove({ key }),
};

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: createAsyncStoragePersister({ storage, key: queryCacheKey }),
  maxAge: cacheMaxAge,
  buster: import.meta.env.VITE_APP_VERSION ?? "dev",
  dehydrateOptions: { shouldDehydrateMutation: () => false },
};
