export const endpoints = {
  auth: {
    register: "auth/register",
    login: "auth/login",
    refresh: "auth/refresh",
    logout: "auth/logout",
    confirmEmail: "auth/email/confirm",
    resendConfirmation: "auth/email/resend",
    forgotPassword: "auth/password/forgot",
    resetPassword: "auth/password/reset",
    exportMyData: "auth/me/export",
    deleteAccount: "auth/me",
  },
  profiles: {
    me: "profiles/me",
    myExport: "profiles/me/export",
    myStats: "profiles/me/stats",
    mySlug: "profiles/me/slug",
    myAvatar: "profiles/me/avatar",
    bySlug: (slug: string) => `profiles/by-slug/${encodeURIComponent(slug)}`,
    byUserId: (userId: string) => `profiles/${userId}`,
  },
  peaks: {
    list: "peaks",
    search: "peaks/search",
    nearby: "peaks/nearby",
    byId: (id: string) => `peaks/${id}`,
  },
  ascents: {
    root: "ascents",
    myExport: "ascents/me/export",
    byId: (id: string) => `ascents/${id}`,
    byUser: (userId: string) => `ascents/by-user/${userId}`,
    photos: (id: string) => `ascents/${id}/photos`,
    photo: (id: string, photoId: string) => `ascents/${id}/photos/${photoId}`,
  },
  collections: {
    root: "collections",
    byId: (id: string) => `collections/${id}`,
    peaks: (id: string) => `collections/${id}/peaks`,
    peak: (id: string, peakId: string) => `collections/${id}/peaks/${peakId}`,
  },
} as const;

export const allowedGatewayPrefixes = [
  "auth",
  "profiles",
  "peaks",
  "ascents",
  "collections",
] as const;

export const isAllowedGatewayPath = (segments: readonly string[]): boolean => {
  const [prefix] = segments;

  return (
    prefix !== undefined &&
    (allowedGatewayPrefixes as readonly string[]).includes(prefix)
  );
};
