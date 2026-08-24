import { useEffect, useSyncExternalStore } from "react";

type Leave = () => void;

let dirty = false;
let pending: Leave | undefined = undefined;
const listeners = new Set<() => void>();

const publish = (next: Leave | undefined): void => {
  pending = next;

  for (const listener of listeners) {
    listener();
  }
};

export const getPendingLeave = (): Leave | undefined => pending;

export const subscribePendingLeave = (listener: () => void): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const markUnsavedChanges = (value: boolean): void => {
  dirty = value;
};

export const requestLeave = (leave: Leave): void => {
  if (dirty) {
    publish(leave);

    return;
  }

  leave();
};

export const confirmLeave = (): void => {
  const leave = pending;

  dirty = false;
  publish(undefined);
  leave?.();
};

export const cancelLeave = (): void => publish(undefined);

export const useUnsavedChanges = (value: boolean): void => {
  useEffect(() => {
    markUnsavedChanges(value);

    return () => markUnsavedChanges(false);
  }, [value]);
};

export const usePendingLeave = (): Leave | undefined =>
  useSyncExternalStore(subscribePendingLeave, getPendingLeave, getPendingLeave);
