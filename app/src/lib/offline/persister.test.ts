import { beforeEach, describe, expect, it, vi } from "vitest";

const preferencesGet = vi.fn();
const preferencesSet = vi.fn();
const preferencesRemove = vi.fn();

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: (options: { key: string }) => preferencesGet(options),
    set: (options: { key: string; value: string }) => preferencesSet(options),
    remove: (options: { key: string }) => preferencesRemove(options),
  },
}));

interface StoragePersister {
  persistClient: (client: unknown) => Promise<void>;
  restoreClient: () => Promise<unknown>;
  removeClient: () => Promise<void>;
}

const { cacheMaxAge, persistOptions, queryCacheKey } = await import(
  "./persister"
);

const persister = persistOptions.persister as unknown as StoragePersister;

beforeEach(() => {
  vi.resetAllMocks();
  preferencesGet.mockResolvedValue({ value: null });
  preferencesSet.mockResolvedValue(undefined);
  preferencesRemove.mockResolvedValue(undefined);
});

describe("persistOptions", () => {
  it("persister_persistClient_writesToCapacitorPreferences", async () => {
    await persister.persistClient({ buster: "", timestamp: 1, clientState: {} });

    expect(preferencesSet).toHaveBeenCalledWith(
      expect.objectContaining({ key: queryCacheKey }),
    );
  });

  it("persister_restoreClient_readsFromCapacitorPreferences", async () => {
    await persister.restoreClient();

    expect(preferencesGet).toHaveBeenCalledWith({ key: queryCacheKey });
  });

  it("persister_removeClient_clearsTheStoredCache", async () => {
    await persister.removeClient();

    expect(preferencesRemove).toHaveBeenCalledWith({ key: queryCacheKey });
  });

  it("persistOptions_maxAge_isADay", () => {
    expect(cacheMaxAge).toBe(86_400_000);
  });

  it("persistOptions_mutations_areNeverDehydrated", () => {
    expect(persistOptions.dehydrateOptions?.shouldDehydrateMutation?.({} as never)).toBe(
      false,
    );
  });
});
