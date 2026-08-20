import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "./seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl", () => {
  it("siteUrl_withoutConfiguration_fallsBackToTheProductionDomain", () => {
    expect(siteUrl()).toBe("https://peaker.es");
  });

  it("siteUrl_emptyVariable_fallsBackToTheProductionDomain", () => {
    vi.stubEnv("VITE_SITE_URL", "");

    expect(siteUrl()).toBe("https://peaker.es");
  });

  it("siteUrl_configuredDomain_isUsed", () => {
    vi.stubEnv("VITE_SITE_URL", "https://staging.peaker.es");

    expect(siteUrl()).toBe("https://staging.peaker.es");
  });

  it("siteUrl_trailingSlash_isStripped", () => {
    vi.stubEnv("VITE_SITE_URL", "https://peaker.es/");

    expect(siteUrl()).toBe("https://peaker.es");
  });
});
