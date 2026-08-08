import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const appLinkProtocol = "https:";

export const routeOf = (url: string): string | undefined => {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const path =
    parsed.protocol === appLinkProtocol
      ? parsed.pathname
      : `/${parsed.hostname}${parsed.pathname}`;

  const route = `${path}${parsed.search}`;

  return route === "/" ? undefined : route;
};

export const useAppUrlOpen = (): void => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listener = App.addListener("appUrlOpen", ({ url }) => {
      const route = routeOf(url);

      if (route) {
        void navigate(route);
      }
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [navigate]);
};
