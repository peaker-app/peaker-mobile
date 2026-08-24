import { UnconfirmedEmailBanner } from "@/components/features/dashboard/UnconfirmedEmailBanner";
import { DashboardGreeting } from "./DashboardGreeting";
import { DashboardStats } from "./DashboardStats";
import { RecentAscents } from "./RecentAscents";

export const DashboardScreen = () => (
  <main className="flex flex-1 flex-col gap-6 p-6">
    <DashboardGreeting />
    <UnconfirmedEmailBanner />
    <DashboardStats />
    <RecentAscents />
  </main>
);
