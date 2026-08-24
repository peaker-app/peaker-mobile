const fallbackSiteUrl = "https://peaker.es";

export const siteUrl = (): string =>
  (import.meta.env.VITE_SITE_URL || fallbackSiteUrl).replace(/\/$/, "");
