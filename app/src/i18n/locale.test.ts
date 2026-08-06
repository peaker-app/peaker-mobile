import { afterEach, describe, expect, it, vi } from "vitest";

const preferencesGet = vi.fn();
const preferencesSet = vi.fn();
const getLanguageCode = vi.fn();

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: (options: { key: string }) => preferencesGet(options),
    set: (options: { key: string; value: string }) => preferencesSet(options),
  },
}));

vi.mock("@capacitor/device", () => ({
  Device: { getLanguageCode: () => getLanguageCode() },
}));

const stored = (value: string | null) => {
  preferencesGet.mockResolvedValue({ value });
};

const deviceLanguage = (value: string) => {
  getLanguageCode.mockResolvedValue({ value });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("readStoredLocale", () => {
  it("readStoredLocale_supportedValue_returnsIt", async () => {
    const { readStoredLocale } = await import("./locale");
    stored("ar");

    await expect(readStoredLocale()).resolves.toBe("ar");
  });

  it("readStoredLocale_nothingStored_returnsUndefined", async () => {
    const { readStoredLocale } = await import("./locale");
    stored(null);

    await expect(readStoredLocale()).resolves.toBeUndefined();
  });

  it("readStoredLocale_unsupportedValue_isIgnored", async () => {
    const { readStoredLocale } = await import("./locale");
    stored("de");

    await expect(readStoredLocale()).resolves.toBeUndefined();
  });
});

describe("storeLocale", () => {
  it("storeLocale_persistsUnderTheAgreedKey", async () => {
    const { localePreferenceKey, storeLocale } = await import("./locale");

    await storeLocale("fr");

    expect(preferencesSet).toHaveBeenCalledWith({
      key: localePreferenceKey,
      value: "fr",
    });
  });
});

describe("detectDeviceLocale", () => {
  it("detectDeviceLocale_supportedLanguage_returnsIt", async () => {
    const { detectDeviceLocale } = await import("./locale");
    deviceLanguage("es");

    await expect(detectDeviceLocale()).resolves.toBe("es");
  });

  it("detectDeviceLocale_unsupportedLanguage_returnsUndefined", async () => {
    const { detectDeviceLocale } = await import("./locale");
    deviceLanguage("pt");

    await expect(detectDeviceLocale()).resolves.toBeUndefined();
  });
});

describe("resolveInitialLocale", () => {
  it("resolveInitialLocale_storedPreference_winsOverTheDevice", async () => {
    const { resolveInitialLocale } = await import("./locale");
    stored("zh");
    deviceLanguage("es");

    await expect(resolveInitialLocale()).resolves.toBe("zh");
  });

  it("resolveInitialLocale_withoutPreference_followsTheDevice", async () => {
    const { resolveInitialLocale } = await import("./locale");
    stored(null);
    deviceLanguage("fr");

    await expect(resolveInitialLocale()).resolves.toBe("fr");
  });

  it("resolveInitialLocale_unsupportedEverywhere_fallsBackToEnglish", async () => {
    const { resolveInitialLocale } = await import("./locale");
    stored(null);
    deviceLanguage("pt");

    await expect(resolveInitialLocale()).resolves.toBe("en");
  });
});
