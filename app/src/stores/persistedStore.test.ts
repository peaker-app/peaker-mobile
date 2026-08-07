import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const preferencesGet = vi.fn();
const preferencesSet = vi.fn();

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: (options: { key: string }) => preferencesGet(options),
    set: (options: { key: string; value: string }) => preferencesSet(options),
  },
}));

const { createPersistedStore } = await import("./persistedStore");

interface CounterState {
  count: number;
  label: string;
  increment: () => void;
}

const counter = () => {
  const store = createPersistedStore<CounterState>("counter", {
    count: 0,
    label: "zero",
    increment: () => store.setState({ count: store.getState().count + 1 }),
  });

  return store;
};

const stored = (value: string | null) => {
  preferencesGet.mockResolvedValue({ value });
};

beforeEach(() => {
  vi.resetAllMocks();
  preferencesGet.mockResolvedValue({ value: null });
  preferencesSet.mockResolvedValue(undefined);
});

describe("createPersistedStore", () => {
  it("createPersistedStore_setState_mergesThePatchAndKeepsTheRest", () => {
    const store = counter();

    store.setState({ count: 7 });

    expect(store.getState().count).toBe(7);
    expect(store.getState().label).toBe("zero");
  });

  it("createPersistedStore_actionsDeclaredInTheInitialState_reachTheStore", () => {
    const store = counter();

    store.getState().increment();

    expect(store.getState().count).toBe(1);
  });

  it("createPersistedStore_selector_reRendersOnlyThroughTheSubscription", () => {
    const store = counter();
    const { result } = renderHook(() => store((state) => state.count));

    expect(result.current).toBe(0);

    act(() => {
      store.setState({ count: 3 });
    });

    expect(result.current).toBe(3);
  });

  it("createPersistedStore_unmount_stopsNotifying", () => {
    const store = counter();
    const { unmount } = renderHook(() => store((state) => state.count));

    unmount();
    store.setState({ count: 4 });

    expect(store.getState().count).toBe(4);
  });

  it("createPersistedStore_setState_persistsTheDataWithoutTheActions", () => {
    const store = counter();

    store.setState({ count: 2 });

    expect(preferencesSet).toHaveBeenCalledWith({
      key: "counter",
      value: JSON.stringify({ count: 2, label: "zero" }),
    });
  });

  it("createPersistedStore_failingStorage_isSwallowed", () => {
    preferencesSet.mockRejectedValue(new Error("no storage"));
    const store = counter();

    expect(() => store.setState({ count: 1 })).not.toThrow();
  });

  it("createPersistedStore_hydrate_appliesWhatWasStored", async () => {
    const store = counter();
    stored(JSON.stringify({ count: 9 }));

    await store.hydrate();

    expect(store.getState().count).toBe(9);
    expect(typeof store.getState().increment).toBe("function");
  });

  it("createPersistedStore_hydrate_nothingStored_keepsTheDefaults", async () => {
    const store = counter();
    stored(null);

    await store.hydrate();

    expect(store.getState().count).toBe(0);
  });

  it("createPersistedStore_hydrate_corruptedValue_keepsTheDefaults", async () => {
    const store = counter();
    stored("{not json");

    await store.hydrate();

    expect(store.getState().count).toBe(0);
  });

  it("createPersistedStore_hydrate_nonObjectValue_keepsTheDefaults", async () => {
    const store = counter();
    stored("42");

    await store.hydrate();

    expect(store.getState().count).toBe(0);
  });
});
