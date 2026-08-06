import { Outlet } from "react-router";
import { TabBar } from "./TabBar";
import { DevEntryLink } from "./dev/DevEntryLink";
import { devToolsEnabled } from "./dev/enabled";
import { useAndroidBackButton } from "./useAndroidBackButton";

export const TabShell = () => {
  useAndroidBackButton();

  return (
    <div className="flex min-h-dvh flex-col">
      <Outlet />
      {devToolsEnabled ? <DevEntryLink /> : null}
      <TabBar />
    </div>
  );
};
