import { createPersistedStore } from "./persistedStore";

export type UnitSystem = "metric";
export type AscentListView = "cards" | "table";

interface PreferencesState {
  unitSystem: UnitSystem;
  ascentListView: AscentListView;
  mapsConsent: boolean;
  setAscentListView: (view: AscentListView) => void;
  setMapsConsent: (allowed: boolean) => void;
}

export const preferencesKey = "peaker-preferences";

export const usePreferences = createPersistedStore<PreferencesState>(
  preferencesKey,
  {
    unitSystem: "metric",
    ascentListView: "cards",
    mapsConsent: false,
    setAscentListView: (ascentListView) =>
      usePreferences.setState({ ascentListView }),
    setMapsConsent: (mapsConsent) => usePreferences.setState({ mapsConsent }),
  },
);
