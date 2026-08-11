import { Capacitor } from "@capacitor/core";
import { Network as NetworkPlugin } from "@capacitor/network";

export interface ConnectivityMonitor {
  isConnected(): Promise<boolean>;
  subscribe(listener: (connected: boolean) => void): () => void;
}

export interface NativeNetwork {
  getStatus(): Promise<{ connected: boolean }>;
  addListener(
    event: "networkStatusChange",
    listener: (status: { connected: boolean }) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}

export const createNativeMonitor = (
  plugin: NativeNetwork,
): ConnectivityMonitor => ({
  isConnected: async () => (await plugin.getStatus()).connected,
  subscribe: (listener) => {
    const handle = plugin.addListener("networkStatusChange", (status) => {
      listener(status.connected);
    });

    return () => {
      void handle.then((registration) => registration.remove());
    };
  },
});

export const createWebMonitor = (
  target: Pick<Window, "addEventListener" | "removeEventListener"> = window,
  connectivity: { onLine: boolean } = navigator,
): ConnectivityMonitor => ({
  isConnected: () => Promise.resolve(connectivity.onLine),
  subscribe: (listener) => {
    const online = () => {
      listener(true);
    };

    const offline = () => {
      listener(false);
    };

    target.addEventListener("online", online);
    target.addEventListener("offline", offline);

    return () => {
      target.removeEventListener("online", online);
      target.removeEventListener("offline", offline);
    };
  },
});

export const connectivity: ConnectivityMonitor = Capacitor.isNativePlatform()
  ? createNativeMonitor(NetworkPlugin)
  : createWebMonitor();
