import { Capacitor } from "@capacitor/core";
import { Geolocation as GeolocationPlugin } from "@capacitor/geolocation";

export type LocateOutcome =
  | { status: "located"; latitude: number; longitude: number }
  | { status: "denied" }
  | { status: "unsupported" };

export interface Locator {
  locate(): Promise<LocateOutcome>;
}

interface PermissionSnapshot {
  location: string;
  coarseLocation: string;
}

export interface NativeGeolocation {
  checkPermissions(): Promise<PermissionSnapshot>;
  requestPermissions(options: {
    permissions: "location"[];
  }): Promise<PermissionSnapshot>;
  getCurrentPosition(options: PositionOptions): Promise<{
    coords: { latitude: number; longitude: number };
  }>;
}

interface PositionOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

const positionOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 60_000,
};

const denied: LocateOutcome = { status: "denied" };

const isGranted = (snapshot: PermissionSnapshot): boolean =>
  snapshot.location === "granted" || snapshot.coarseLocation === "granted";

const located = (coords: {
  latitude: number;
  longitude: number;
}): LocateOutcome => ({
  status: "located",
  latitude: coords.latitude,
  longitude: coords.longitude,
});

const allow = async (plugin: NativeGeolocation): Promise<boolean> =>
  isGranted(await plugin.checkPermissions()) ||
  isGranted(await plugin.requestPermissions({ permissions: ["location"] }));

export const createNativeLocator = (plugin: NativeGeolocation): Locator => ({
  locate: async () => {
    try {
      if (!(await allow(plugin))) {
        return denied;
      }

      return located((await plugin.getCurrentPosition(positionOptions)).coords);
    } catch {
      return denied;
    }
  },
});

export const createWebLocator = (
  provider: Geolocation | undefined = navigator.geolocation,
): Locator => ({
  locate: () =>
    new Promise<LocateOutcome>((resolve) => {
      if (!provider) {
        resolve({ status: "unsupported" });

        return;
      }

      provider.getCurrentPosition(
        (position) => resolve(located(position.coords)),
        () => resolve(denied),
        positionOptions,
      );
    }),
});

export const locator: Locator = Capacitor.isNativePlatform()
  ? createNativeLocator(GeolocationPlugin)
  : createWebLocator();
