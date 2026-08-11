import { describe, expect, it, vi } from "vitest";
import {
  createNativeMonitor,
  createWebMonitor,
  type NativeNetwork,
} from "./network";

const nativePlugin = (
  connected: boolean,
): NativeNetwork & { emit: (next: boolean) => void; remove: () => void } => {
  let listener: (status: { connected: boolean }) => void = () => undefined;
  const remove = vi.fn();

  return {
    getStatus: () => Promise.resolve({ connected }),
    addListener: (_event, registered) => {
      listener = registered;

      return Promise.resolve({ remove: () => Promise.resolve(remove()) });
    },
    emit: (next: boolean) => {
      listener({ connected: next });
    },
    remove,
  };
};

const webTarget = () => {
  const handlers = new Map<string, EventListener>();

  return {
    addEventListener: (event: string, handler: EventListener) => {
      handlers.set(event, handler);
    },
    removeEventListener: (event: string) => {
      handlers.delete(event);
    },
    emit: (event: string) => handlers.get(event)?.(new Event(event)),
    has: (event: string) => handlers.has(event),
  };
};

describe("createNativeMonitor", () => {
  it("nativeMonitor_isConnected_readsThePluginStatus", async () => {
    await expect(
      createNativeMonitor(nativePlugin(false)).isConnected(),
    ).resolves.toBe(false);
  });

  it("nativeMonitor_statusChange_reachesTheListener", () => {
    const plugin = nativePlugin(true);
    const listener = vi.fn();

    createNativeMonitor(plugin).subscribe(listener);
    plugin.emit(false);

    expect(listener).toHaveBeenCalledWith(false);
  });

  it("nativeMonitor_unsubscribe_removesThePluginRegistration", async () => {
    const plugin = nativePlugin(true);

    createNativeMonitor(plugin).subscribe(vi.fn())();
    await Promise.resolve();

    expect(plugin.remove).toHaveBeenCalled();
  });
});

describe("createWebMonitor", () => {
  it("webMonitor_isConnected_readsNavigatorOnLine", async () => {
    const monitor = createWebMonitor(webTarget(), { onLine: false });

    await expect(monitor.isConnected()).resolves.toBe(false);
  });

  it("webMonitor_onlineEvent_reportsAConnection", () => {
    const target = webTarget();
    const listener = vi.fn();

    createWebMonitor(target, { onLine: false }).subscribe(listener);
    target.emit("online");

    expect(listener).toHaveBeenCalledWith(true);
  });

  it("webMonitor_offlineEvent_reportsALostConnection", () => {
    const target = webTarget();
    const listener = vi.fn();

    createWebMonitor(target, { onLine: true }).subscribe(listener);
    target.emit("offline");

    expect(listener).toHaveBeenCalledWith(false);
  });

  it("webMonitor_unsubscribe_dropsBothEvents", () => {
    const target = webTarget();

    createWebMonitor(target, { onLine: true }).subscribe(vi.fn())();

    expect(target.has("online")).toBe(false);
    expect(target.has("offline")).toBe(false);
  });
});
