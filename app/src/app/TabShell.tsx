import { Outlet } from "react-router";
import { TabBar } from "./TabBar";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { useAndroidBackButton } from "./useAndroidBackButton";

export const TabShell = () => {
  useAndroidBackButton();

  return (
    <div className="safe-top safe-x flex h-dvh flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </div>
      <TabBar />
      <UnsavedChangesDialog />
    </div>
  );
};
