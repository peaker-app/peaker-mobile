import { describe, expect, it, vi } from "vitest";
import {
  createNativeLocator,
  createWebLocator,
  type NativeGeolocation,
} from "./geolocation";

const position = { coords: { latitude: 42.64, longitude: 0.65 } };

const plugin = (overrides: Partial<NativeGeolocation> = {}): NativeGeolocation => ({
  checkPermissions: () =>
    Promise.resolve({ location: "prompt", coarseLocation: "prompt" }),
  requestPermissions: () =>
    Promise.resolve({ location: "granted", coarseLocation: "granted" }),
  getCurrentPosition: () => Promise.resolve(position),
  ...overrides,
});

const webProvider = (
  getCurrentPosition: Geolocation["getCurrentPosition"],
): Geolocation => ({ getCurrentPosition }) as Geolocation;

describe("createNativeLocator", () => {
  it("nativeLocator_permissionAlreadyGranted_doesNotAskAgain", async () => {
    const requestPermissions = vi.fn();
    const locator = createNativeLocator(
      plugin({
        checkPermissions: () =>
          Promise.resolve({ location: "granted", coarseLocation: "denied" }),
        requestPermissions,
      }),
    );

    await expect(locator.locate()).resolves.toEqual({
      status: "located",
      latitude: 42.64,
      longitude: 0.65,
    });
    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it("nativeLocator_coarsePermissionOnly_isStillEnoughToLocate", async () => {
    const locator = createNativeLocator(
      plugin({
        checkPermissions: () =>
          Promise.resolve({ location: "denied", coarseLocation: "granted" }),
      }),
    );

    await expect(locator.locate()).resolves.toMatchObject({
      status: "located",
    });
  });

  it("nativeLocator_undecidedPermission_asksTheUserBeforeLocating", async () => {
    const requestPermissions = vi.fn(() =>
      Promise.resolve({ location: "granted", coarseLocation: "granted" }),
    );
    const locator = createNativeLocator(plugin({ requestPermissions }));

    await expect(locator.locate()).resolves.toMatchObject({
      status: "located",
    });
    expect(requestPermissions).toHaveBeenCalledWith({
      permissions: ["location"],
    });
  });

  it("nativeLocator_permissionRefused_fallsBackToManualEntry", async () => {
    const locator = createNativeLocator(
      plugin({
        requestPermissions: () =>
          Promise.resolve({ location: "denied", coarseLocation: "denied" }),
      }),
    );

    await expect(locator.locate()).resolves.toEqual({ status: "denied" });
  });

  it("nativeLocator_failureWithoutACode_isReportedAsDeniedNotAsUnsupported", async () => {
    const locator = createNativeLocator(
      plugin({
        checkPermissions: () => Promise.reject(new Error("vaya")),
      }),
    );

    await expect(locator.locate()).resolves.toEqual({ status: "denied" });
  });

  it.each([
    ["OS-PLUG-GLOC-0007", "los servicios de ubicacion estan apagados"],
    ["OS-PLUG-GLOC-0009", "el usuario rechazo encenderlos"],
    ["OS-PLUG-GLOC-0017", "red y ubicacion apagadas"],
  ])(
    "nativeLocator_%s_isToldApartFromAPlainRefusal",
    async (code) => {
      const locator = createNativeLocator(
        plugin({
          checkPermissions: () => Promise.reject(Object.assign(new Error("off"), { code })),
        }),
      );

      await expect(locator.locate()).resolves.toEqual({
        status: "servicesDisabled",
      });
    },
  );

  it("nativeLocator_permissionDeniedCode_staysDenied", async () => {
    const locator = createNativeLocator(
      plugin({
        checkPermissions: () =>
          Promise.reject(
            Object.assign(new Error("denied"), { code: "OS-PLUG-GLOC-0003" }),
          ),
      }),
    );

    await expect(locator.locate()).resolves.toEqual({ status: "denied" });
  });

  it("nativeLocator_position_acceptsARecentFixInsteadOfDemandingAFreshOne", async () => {
    const getCurrentPosition = vi.fn(() => Promise.resolve(position));
    const locator = createNativeLocator(
      plugin({
        checkPermissions: () =>
          Promise.resolve({ location: "granted", coarseLocation: "granted" }),
        getCurrentPosition,
      }),
    );

    await locator.locate();

    expect(getCurrentPosition).toHaveBeenCalledWith({
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 60_000,
    });
  });

  it("nativeLocator_positionTimesOut_isReportedAsDenied", async () => {
    const locator = createNativeLocator(
      plugin({
        checkPermissions: () =>
          Promise.resolve({ location: "granted", coarseLocation: "granted" }),
        getCurrentPosition: () => Promise.reject(new Error("timeout")),
      }),
    );

    await expect(locator.locate()).resolves.toEqual({ status: "denied" });
  });
});

describe("createWebLocator", () => {
  it("webLocator_withoutGeolocation_isUnsupported", async () => {
    await expect(createWebLocator(undefined).locate()).resolves.toEqual({
      status: "unsupported",
    });
  });

  it("webLocator_positionGranted_reportsTheCoordinates", async () => {
    const locator = createWebLocator(
      webProvider((success) => success(position as GeolocationPosition)),
    );

    await expect(locator.locate()).resolves.toEqual({
      status: "located",
      latitude: 42.64,
      longitude: 0.65,
    });
  });

  it("webLocator_positionRefused_isDenied", async () => {
    const locator = createWebLocator(
      webProvider((_success, error) =>
        error?.({} as GeolocationPositionError),
      ),
    );

    await expect(locator.locate()).resolves.toEqual({ status: "denied" });
  });
});
