const fallbackSiteUrl = "https://peaker.app";

export const siteUrl = (): string =>
  (import.meta.env.VITE_SITE_URL ?? fallbackSiteUrl).replace(/\/$/, "");
