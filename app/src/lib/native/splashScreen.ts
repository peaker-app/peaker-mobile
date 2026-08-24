import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

export interface LaunchScreen {
  hide(): Promise<void>;
}

export const createPluginLaunchScreen = (plugin: LaunchScreen): LaunchScreen => ({
  hide: () => plugin.hide(),
});

export const createNoopLaunchScreen = (): LaunchScreen => ({
  hide: () => Promise.resolve(),
});

export const launchScreen: LaunchScreen = Capacitor.isNativePlatform()
  ? createPluginLaunchScreen(SplashScreen)
  : createNoopLaunchScreen();
