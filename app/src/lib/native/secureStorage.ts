import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { Capacitor } from "@capacitor/core";

export interface SecureStore {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface KeyValueStoragePlugin {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const createMemorySecureStore = (): SecureStore => {
  const entries = new Map<string, string>();

  return {
    get: (key) => Promise.resolve(entries.get(key)),
    set: (key, value) => {
      entries.set(key, value);

      return Promise.resolve();
    },
    remove: (key) => {
      entries.delete(key);

      return Promise.resolve();
    },
  };
};

export const createPluginSecureStore = (
  plugin: KeyValueStoragePlugin,
): SecureStore => ({
  get: async (key) => (await plugin.getItem(key)) ?? undefined,
  set: (key, value) => plugin.setItem(key, value),
  remove: (key) => plugin.removeItem(key),
});

export const secureStore: SecureStore = Capacitor.isNativePlatform()
  ? createPluginSecureStore(SecureStorage)
  : createMemorySecureStore();
