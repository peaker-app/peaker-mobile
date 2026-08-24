import { useSyncExternalStore } from "react";
import { restoreSession } from "@/lib/auth/session";
import { getSessionState, subscribeSession } from "@/lib/auth/sessionStore";
import { connectivity } from "@/lib/native/network";
import { syncQueuedAscents } from "./sync";

let online = true;
const listeners = new Set<() => void>();

const getSnapshot = (): boolean => online;

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const publish = (next: boolean): void => {
  if (next === online) {
    return;
  }

  online = next;

  for (const listener of listeners) {
    listener();
  }
};

export const useIsOnline = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

const syncWhenPossible = (): void => {
  if (online && getSessionState().status === "authenticated") {
    void syncQueuedAscents();
  }
};

const recoverSessionThenSync = async (): Promise<void> => {
  if (getSessionState().status !== "authenticated") {
    await restoreSession();
  }

  syncWhenPossible();
};

export const startOfflineSync = async (): Promise<void> => {
  connectivity.subscribe((connected) => {
    publish(connected);

    if (connected) {
      void recoverSessionThenSync();
    }
  });

  subscribeSession(syncWhenPossible);

  publish(await connectivity.isConnected());
  syncWhenPossible();
};
