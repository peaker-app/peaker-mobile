const isSafeRelativePath = (value: string): boolean =>
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.startsWith("/\\") &&
  !value.includes("\\");

export const sanitizeNextPath = (
  value: string | null | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  return isSafeRelativePath(trimmed) ? trimmed : undefined;
};

export const dashboardPath = "/dashboard";

export const stripLocalePrefix = (path: string, locale: string): string => {
  const prefix = `/${locale}`;

  if (path === prefix) {
    return "/";
  }

  return path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
};

export const resolveNextPath = (
  value: string | null | undefined,
  locale: string,
): string => {
  const safe = sanitizeNextPath(value);

  return safe ? stripLocalePrefix(safe, locale) : dashboardPath;
};
