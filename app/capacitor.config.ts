import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.peaker.mobile",
  appName: "Peaker",
  webDir: "dist",
  plugins: {
    CapacitorHttp: { enabled: true },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
