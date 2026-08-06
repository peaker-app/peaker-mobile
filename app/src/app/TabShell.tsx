import { Outlet } from "react-router";
import { TabBar } from "./TabBar";
import { useAndroidBackButton } from "./useAndroidBackButton";

export const TabShell = () => {
  useAndroidBackButton();

  return (
    <div className="flex min-h-dvh flex-col">
      <Outlet />
      <TabBar />
    </div>
  );
};
