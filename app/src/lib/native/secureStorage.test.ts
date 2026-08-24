import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemorySecureStore,
  createPluginSecureStore,
  type KeyValueStoragePlugin,
} from "./secureStorage";

const fakePlugin = (): KeyValueStoragePlugin => ({
  getItem: vi.fn().mockResolvedValue(null),
  setItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
});

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@capacitor/core");
  vi.doUnmock("@aparajita/capacitor-secure-storage");
});

describe("createMemorySecureStore", () => {
  it("get_afterSet_returnsTheStoredValue", async () => {
    const store = createMemorySecureStore();

    await store.set("token", "abc");

    await expect(store.get("token")).resolves.toBe("abc");
  });

  it("get_unknownKey_resolvesToUndefined", async () => {
    await expect(createMemorySecureStore().get("missing")).resolves.toBeUndefined();
  });

  it("remove_storedKey_forgetsIt", async () => {
    const store = createMemorySecureStore();
    await store.set("token", "abc");

    await store.remove("token");

    await expect(store.get("token")).resolves.toBeUndefined();
  });

  it("instances_areIndependent", async () => {
    const first = createMemorySecureStore();
    await first.set("token", "abc");

    await expect(createMemorySecureStore().get("token")).resolves.toBeUndefined();
  });
});

describe("createPluginSecureStore", () => {
  it("get_pluginReturnsNull_isNormalisedToUndefined", async () => {
    const plugin = fakePlugin();

    await expect(createPluginSecureStore(plugin).get("token")).resolves.toBeUndefined();
    expect(plugin.getItem).toHaveBeenCalledWith("token");
  });

  it("get_pluginReturnsAValue_passesItThrough", async () => {
    const plugin = fakePlugin();
    vi.mocked(plugin.getItem).mockResolvedValue("abc");

    await expect(createPluginSecureStore(plugin).get("token")).resolves.toBe("abc");
  });

  it("setAndRemove_delegateToThePlugin", async () => {
    const plugin = fakePlugin();
    const store = createPluginSecureStore(plugin);

    await store.set("token", "abc");
    await store.remove("token");

    expect(plugin.setItem).toHaveBeenCalledWith("token", "abc");
    expect(plugin.removeItem).toHaveBeenCalledWith("token");
  });
});

describe("secureStore", () => {
  it("secureStore_offDevice_neverTouchesLocalStorage", async () => {
    vi.resetModules();
    vi.doMock("@capacitor/core", () => ({
      Capacitor: { isNativePlatform: () => false },
    }));
    const { secureStore } = await import("./secureStorage");

    await secureStore.set("peaker.refreshToken", "must-not-persist");

    expect(localStorage.length).toBe(0);
  });

  it("secureStore_onDevice_usesTheEncryptedPlugin", async () => {
    const plugin = fakePlugin();
    vi.resetModules();
    vi.doMock("@capacitor/core", () => ({
      Capacitor: { isNativePlatform: () => true },
    }));
    vi.doMock("@aparajita/capacitor-secure-storage", () => ({
      SecureStorage: plugin,
    }));
    const { secureStore } = await import("./secureStorage");

    await secureStore.set("peaker.refreshToken", "abc");

    expect(plugin.setItem).toHaveBeenCalledWith("peaker.refreshToken", "abc");
    expect(localStorage.length).toBe(0);
  });
});
