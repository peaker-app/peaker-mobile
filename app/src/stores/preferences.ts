import { createPersistedStore } from "./persistedStore";

export type UnitSystem = "metric";
export type AscentListView = "cards" | "table";

interface PreferencesState {
  unitSystem: UnitSystem;
  ascentListView: AscentListView;
  setAscentListView: (view: AscentListView) => void;
}

export const preferencesKey = "peaker-preferences";

export const usePreferences = createPersistedStore<PreferencesState>(
  preferencesKey,
  {
    unitSystem: "metric",
    ascentListView: "cards",
    setAscentListView: (ascentListView) =>
      usePreferences.setState({ ascentListView }),
  },
);
