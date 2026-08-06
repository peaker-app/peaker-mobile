import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ErrorBoundary } from "./ErrorBoundary";
import { NotFoundScreen } from "./NotFoundScreen";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { Providers } from "./Providers";
import { RequireAnonymous } from "./RequireAnonymous";
import { RequireSession } from "./RequireSession";
import { SessionGate } from "./SessionGate";
import { TabShell } from "./TabShell";
import { AccountScreen } from "./account/AccountScreen";
import { AuthLayout } from "./auth/AuthLayout";
import { ConfirmEmailScreen } from "./auth/ConfirmEmailScreen";
import { LoginScreen } from "./auth/LoginScreen";
import { RegisterScreen } from "./auth/RegisterScreen";
import { ResendConfirmationScreen } from "./auth/ResendConfirmationScreen";
import { NearbyPeaksScreen } from "./peaks/NearbyPeaksScreen";
import { PeakDetailScreen } from "./peaks/PeakDetailScreen";
import { PeaksScreen } from "./peaks/PeaksScreen";

const publicRoutes: readonly { path: string; titleKey: string }[] = [
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
];

export const App = () => (
  <Providers>
    <SessionGate>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route element={<TabShell />}>
              <Route index element={<Navigate to="/peaks" replace />} />
              <Route path="peaks" element={<PeaksScreen />} />
              <Route path="peaks/nearby" element={<NearbyPeaksScreen />} />
              <Route path="peaks/:id" element={<PeakDetailScreen />} />
              {publicRoutes.map(({ path, titleKey }) => (
                <Route
                  key={path}
                  path={path}
                  element={<PlaceholderScreen titleKey={titleKey} />}
                />
              ))}
              <Route element={<RequireSession />}>
                <Route
                  path="dashboard/settings/account"
                  element={<AccountScreen />}
                />
                {privateRoutes.map(({ path, titleKey }) => (
                  <Route
                    key={path}
                    path={path}
                    element={<PlaceholderScreen titleKey={titleKey} />}
                  />
                ))}
              </Route>
            </Route>
            <Route element={<AuthLayout />}>
              <Route element={<RequireAnonymous />}>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
              </Route>
              <Route path="/confirm-email" element={<ConfirmEmailScreen />} />
              <Route element={<RequireSession />}>
                <Route
                  path="/confirm-email/pending"
                  element={<ResendConfirmationScreen />}
                />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </SessionGate>
  </Providers>
);
