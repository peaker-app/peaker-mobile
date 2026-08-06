import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ErrorBoundary } from "./ErrorBoundary";
import { NotFoundScreen } from "./NotFoundScreen";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { Providers } from "./Providers";
import { RequireSession } from "./RequireSession";
import { SessionGate } from "./SessionGate";
import { TabShell } from "./TabShell";
import { devToolsEnabled } from "./dev/enabled";
import { SessionDevRoute } from "./dev/SessionDevRoute";

const publicRoutes: readonly { path: string; titleKey: string }[] = [
  { path: "peaks", titleKey: "peaks" },
  { path: "peaks/nearby", titleKey: "nearby" },
  { path: "peaks/:id", titleKey: "peaks" },
  { path: "climbers/:slug", titleKey: "profile" },
  { path: "ascents/:id", titleKey: "myAscents" },
];

const privateRoutes: readonly { path: string; titleKey: string }[] = [
  { path: "dashboard", titleKey: "dashboard" },
  { path: "dashboard/ascents", titleKey: "myAscents" },
  { path: "dashboard/ascents/new", titleKey: "myAscents" },
  { path: "dashboard/ascents/:id", titleKey: "myAscents" },
  { path: "dashboard/ascents/:id/edit", titleKey: "myAscents" },
  { path: "dashboard/collections", titleKey: "collections" },
  { path: "dashboard/collections/:id", titleKey: "collections" },
  { path: "dashboard/settings/profile", titleKey: "profile" },
  { path: "dashboard/settings/account", titleKey: "account" },
];

const authRoutes: readonly { path: string; titleKey: string }[] = [
  { path: "/login", titleKey: "signIn" },
  { path: "/register", titleKey: "signUp" },
  { path: "/confirm-email", titleKey: "signUp" },
];

export const App = () => (
  <Providers>
    <SessionGate>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route element={<TabShell />}>
              <Route index element={<Navigate to="/peaks" replace />} />
              {publicRoutes.map(({ path, titleKey }) => (
                <Route
                  key={path}
                  path={path}
                  element={<PlaceholderScreen titleKey={titleKey} />}
                />
              ))}
              <Route element={<RequireSession />}>
                {privateRoutes.map(({ path, titleKey }) => (
                  <Route
                    key={path}
                    path={path}
                    element={<PlaceholderScreen titleKey={titleKey} />}
                  />
                ))}
              </Route>
            </Route>
            {authRoutes.map(({ path, titleKey }) => (
              <Route
                key={path}
                path={path}
                element={<PlaceholderScreen titleKey={titleKey} />}
              />
            ))}
            {devToolsEnabled ? (
              <Route path="/__dev/session" element={<SessionDevRoute />} />
            ) : null}
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </SessionGate>
  </Providers>
);
