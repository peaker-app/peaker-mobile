import { Preferences } from "@capacitor/preferences";
import { useSyncExternalStore } from "react";

export interface PersistedStore<T extends object> {
  <S>(selector: (state: T) => S): S;
  getState: () => T;
  setState: (patch: Partial<T>) => void;
  hydrate: () => Promise<void>;
}

const write = (key: string, state: object): void => {
  void Preferences.set({ key, value: JSON.stringify(state) }).catch(
    () => undefined,
  );
};

const read = async <T extends object>(key: string): Promise<Partial<T>> => {
  try {
    const { value } = await Preferences.get({ key });
    const parsed: unknown = JSON.parse(value ?? "");

    return typeof parsed === "object" && parsed !== null
      ? (parsed as Partial<T>)
      : {};
  } catch {
    return {};
  }
};

export const createPersistedStore = <T extends object>(
  key: string,
  initial: T,
): PersistedStore<T> => {
  const listeners = new Set<() => void>();
  let state = initial;

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  const setState = (patch: Partial<T>): void => {
    state = { ...state, ...patch };

    for (const listener of listeners) {
      listener();
    }

    write(key, state);
  };

  const useStore = <S>(selector: (value: T) => S): S => {
    const snapshot = () => selector(state);

    return useSyncExternalStore(subscribe, snapshot, snapshot);
  };

  return Object.assign(useStore, {
    getState: () => state,
    setState,
    hydrate: async () => setState(await read<T>(key)),
  });
};
