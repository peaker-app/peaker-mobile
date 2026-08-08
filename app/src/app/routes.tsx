import { Navigate, Route, Routes, useLocation } from "react-router";
import { useAppUrlOpen } from "./useAppUrlOpen";
import { NotFoundScreen } from "./NotFoundScreen";
import { RequireAnonymous } from "./RequireAnonymous";
import { RequireSession } from "./RequireSession";
import { TabShell } from "./TabShell";
import { AccountScreen } from "./account/AccountScreen";
import { PublicAscentScreen } from "./ascents/PublicAscentScreen";
import { PublicProfileScreen } from "./climbers/PublicProfileScreen";
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
import { CollectionDetailScreen } from "./dashboard/collections/CollectionDetailScreen";
import { CollectionsScreen } from "./dashboard/collections/CollectionsScreen";
import { NearbyPeaksScreen } from "./peaks/NearbyPeaksScreen";
import { PeakDetailScreen } from "./peaks/PeakDetailScreen";
import { PeaksScreen } from "./peaks/PeaksScreen";
import { ProfileSettingsScreen } from "./dashboard/settings/ProfileSettingsScreen";

const IndexRedirect = () => {
  const { search } = useLocation();

  return <Navigate to={`/peaks${search}`} replace />;
};

const shellRoutes = (
  <Route element={<TabShell />}>
    <Route index element={<IndexRedirect />} />
    <Route path="peaks" element={<PeaksScreen />} />
    <Route path="peaks/nearby" element={<NearbyPeaksScreen />} />
    <Route path="peaks/:id" element={<PeakDetailScreen />} />
    <Route path="ascents/:id" element={<PublicAscentScreen />} />
    <Route path="climbers/:slug" element={<PublicProfileScreen />} />
    <Route element={<RequireSession />}>
      <Route path="dashboard" element={<DashboardScreen />} />
      <Route path="dashboard/ascents" element={<MyAscentsScreen />} />
      <Route path="dashboard/ascents/new" element={<NewAscentScreen />} />
      <Route path="dashboard/ascents/:id" element={<AscentDetailScreen />} />
      <Route
        path="dashboard/ascents/:id/edit"
        element={<EditAscentScreen />}
      />
      <Route path="dashboard/collections" element={<CollectionsScreen />} />
      <Route
        path="dashboard/collections/:id"
        element={<CollectionDetailScreen />}
      />
      <Route
        path="dashboard/settings/profile"
        element={<ProfileSettingsScreen />}
      />
      <Route path="dashboard/settings/account" element={<AccountScreen />} />
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

export const AppRoutes = () => {
  useAppUrlOpen();

  return (
    <Routes>
      {shellRoutes}
      {authRoutes}
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
};
