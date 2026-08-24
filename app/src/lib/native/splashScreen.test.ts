import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createNoopLaunchScreen,
  createPluginLaunchScreen,
  type LaunchScreen,
} from "./splashScreen";

const fakePlugin = (): LaunchScreen => ({
  hide: vi.fn().mockResolvedValue(undefined),
});

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@capacitor/core");
  vi.doUnmock("@capacitor/splash-screen");
});

describe("createNoopLaunchScreen", () => {
  it("hide_offDevice_resolvesWithoutThrowing", async () => {
    await expect(createNoopLaunchScreen().hide()).resolves.toBeUndefined();
  });
});

describe("createPluginLaunchScreen", () => {
  it("hide_delegatesToThePlugin", async () => {
    const plugin = fakePlugin();

    await createPluginLaunchScreen(plugin).hide();

    expect(plugin.hide).toHaveBeenCalledTimes(1);
  });
});

describe("launchScreen", () => {
  it("launchScreen_offDevice_doesNotCallThePlugin", async () => {
    const plugin = fakePlugin();
    vi.resetModules();
    vi.doMock("@capacitor/core", () => ({
      Capacitor: { isNativePlatform: () => false },
    }));
    vi.doMock("@capacitor/splash-screen", () => ({ SplashScreen: plugin }));
    const { launchScreen } = await import("./splashScreen");

    await launchScreen.hide();

    expect(plugin.hide).not.toHaveBeenCalled();
  });

  it("launchScreen_onDevice_hidesThroughThePlugin", async () => {
    const plugin = fakePlugin();
    vi.resetModules();
    vi.doMock("@capacitor/core", () => ({
      Capacitor: { isNativePlatform: () => true },
    }));
    vi.doMock("@capacitor/splash-screen", () => ({ SplashScreen: plugin }));
    const { launchScreen } = await import("./splashScreen");

    await launchScreen.hide();

    expect(plugin.hide).toHaveBeenCalledTimes(1);
  });
});
