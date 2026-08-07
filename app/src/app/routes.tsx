import { Navigate, Route, Routes } from "react-router";
import { NotFoundScreen } from "./NotFoundScreen";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { RequireAnonymous } from "./RequireAnonymous";
import { RequireSession } from "./RequireSession";
import { TabShell } from "./TabShell";
import { AccountScreen } from "./account/AccountScreen";
import { PublicAscentScreen } from "./ascents/PublicAscentScreen";
import { AuthLayout } from "./auth/AuthLayout";
import { ConfirmEmailScreen } from "./auth/ConfirmEmailScreen";
import { LoginScreen } from "./auth/LoginScreen";
import { RegisterScreen } from "./auth/RegisterScreen";
import { ResendConfirmationScreen } from "./auth/ResendConfirmationScreen";
import { DashboardScreen } from "./dashboard/DashboardScreen";
import { AscentDetailScreen } from "./dashboard/ascents/AscentDetailScreen";
import { EditAscentScreen } from "./dashboard/ascents/EditAscentScreen";
import { MyAscentsScreen } from "./dashboard/ascents/MyAscentsScreen";
import { NewAscentScreen } from "./dashboard/ascents/NewAscentScreen";
import { NearbyPeaksScreen } from "./peaks/NearbyPeaksScreen";
import { PeakDetailScreen } from "./peaks/PeakDetailScreen";
import { PeaksScreen } from "./peaks/PeaksScreen";

const pending: readonly { path: string; titleKey: string }[] = [
  { path: "climbers/:slug", titleKey: "profile" },
  { path: "dashboard/collections", titleKey: "collections" },
  { path: "dashboard/collections/:id", titleKey: "collections" },
  { path: "dashboard/settings/profile", titleKey: "profile" },
];

const pendingRoutes = pending.map(({ path, titleKey }) => (
  <Route
    key={path}
    path={path}
    element={<PlaceholderScreen titleKey={titleKey} />}
  />
));

const shellRoutes = (
  <Route element={<TabShell />}>
    <Route index element={<Navigate to="/peaks" replace />} />
    <Route path="peaks" element={<PeaksScreen />} />
    <Route path="peaks/nearby" element={<NearbyPeaksScreen />} />
    <Route path="peaks/:id" element={<PeakDetailScreen />} />
    <Route path="ascents/:id" element={<PublicAscentScreen />} />
    <Route element={<RequireSession />}>
      <Route path="dashboard" element={<DashboardScreen />} />
      <Route path="dashboard/ascents" element={<MyAscentsScreen />} />
      <Route path="dashboard/ascents/new" element={<NewAscentScreen />} />
      <Route path="dashboard/ascents/:id" element={<AscentDetailScreen />} />
      <Route
        path="dashboard/ascents/:id/edit"
        element={<EditAscentScreen />}
      />
      <Route path="dashboard/settings/account" element={<AccountScreen />} />
      {pendingRoutes}
    </Route>
  </Route>
);

const authRoutes = (
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
);

export const AppRoutes = () => (
  <Routes>
    {shellRoutes}
    {authRoutes}
    <Route path="*" element={<NotFoundScreen />} />
  </Routes>
);
