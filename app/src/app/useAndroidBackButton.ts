import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export const useAndroidBackButton = (): void => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listener = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        void navigate(-1);

        return;
      }

      void App.exitApp();
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [navigate]);
};
