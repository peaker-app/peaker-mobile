import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.peaker.mobile",
  appName: "Peaker",
  webDir: "dist",
  plugins: {
    CapacitorHttp: { enabled: true },
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: false,
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
