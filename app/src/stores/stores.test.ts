import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

const { usePreferences } = await import("./preferences");
const { useEmailConfirmation } = await import("./emailConfirmation");

afterEach(() => {
  usePreferences.setState({ ascentListView: "cards" });
  useEmailConfirmation.setState({ unconfirmed: false });
});

describe("usePreferences", () => {
  it("usePreferences_default_showsTheCardView", () => {
    expect(usePreferences.getState().ascentListView).toBe("cards");
    expect(usePreferences.getState().unitSystem).toBe("metric");
  });

  it("usePreferences_setAscentListView_switchesToTheTable", () => {
    usePreferences.getState().setAscentListView("table");

    expect(usePreferences.getState().ascentListView).toBe("table");
  });
});

describe("useEmailConfirmation", () => {
  it("useEmailConfirmation_default_isConfirmed", () => {
    expect(useEmailConfirmation.getState().unconfirmed).toBe(false);
  });

  it("useEmailConfirmation_markUnconfirmed_raisesTheFlag", () => {
    useEmailConfirmation.getState().markUnconfirmed();

    expect(useEmailConfirmation.getState().unconfirmed).toBe(true);
  });

  it("useEmailConfirmation_clear_lowersTheFlag", () => {
    useEmailConfirmation.getState().markUnconfirmed();
    useEmailConfirmation.getState().clear();

    expect(useEmailConfirmation.getState().unconfirmed).toBe(false);
  });
});
