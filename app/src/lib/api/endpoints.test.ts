import { describe, expect, it } from "vitest";
import { endpoints, isAllowedGatewayPath } from "./endpoints";

describe("isAllowedGatewayPath", () => {
  it.each([
    ["auth", "login"],
    ["profiles", "me"],
    ["peaks", "search"],
    ["ascents", "by-user", "abc"],
    ["collections"],
  ])("isAllowedGatewayPath_knownPrefix_returnsTrue", (...segments) => {
    expect(isAllowedGatewayPath(segments)).toBe(true);
  });

  it.each([[["admin"]], [["internal", "metrics"]], [[".well-known"]], [[]]])(
    "isAllowedGatewayPath_unknownPrefix_returnsFalse",
    (segments) => {
      expect(isAllowedGatewayPath(segments)).toBe(false);
    },
  );
});

describe("endpoints", () => {
  it("endpoints_bySlug_encodesTheSlug", () => {
    expect(endpoints.profiles.bySlug("a b/c")).toBe("profiles/by-slug/a%20b%2Fc");
  });

  it("endpoints_photo_buildsNestedPath", () => {
    expect(endpoints.ascents.photo("a1", "p2")).toBe("ascents/a1/photos/p2");
  });

  it("endpoints_profiles_matchTheProfilesController", () => {
    expect(endpoints.profiles.me).toBe("profiles/me");
    expect(endpoints.profiles.myStats).toBe("profiles/me/stats");
    expect(endpoints.profiles.mySlug).toBe("profiles/me/slug");
    expect(endpoints.profiles.myAvatar).toBe("profiles/me/avatar");
    expect(endpoints.profiles.byUserId("u1")).toBe("profiles/u1");
  });

  it("endpoints_peaks_matchThePeaksController", () => {
    expect(endpoints.peaks.list).toBe("peaks");
    expect(endpoints.peaks.search).toBe("peaks/search");
    expect(endpoints.peaks.nearby).toBe("peaks/nearby");
    expect(endpoints.peaks.byId("p1")).toBe("peaks/p1");
  });

  it("endpoints_ascents_matchTheAscentsController", () => {
    expect(endpoints.ascents.root).toBe("ascents");
    expect(endpoints.ascents.byId("a1")).toBe("ascents/a1");
    expect(endpoints.ascents.byUser("u1")).toBe("ascents/by-user/u1");
    expect(endpoints.ascents.photos("a1")).toBe("ascents/a1/photos");
  });

  it("endpoints_collections_matchTheCollectionsController", () => {
    expect(endpoints.collections.root).toBe("collections");
    expect(endpoints.collections.byId("c1")).toBe("collections/c1");
    expect(endpoints.collections.peaks("c1")).toBe("collections/c1/peaks");
    expect(endpoints.collections.peak("c1", "p1")).toBe(
      "collections/c1/peaks/p1",
    );
  });

  it("endpoints_auth_matchTheAuthController", () => {
    expect(endpoints.auth.register).toBe("auth/register");
    expect(endpoints.auth.login).toBe("auth/login");
    expect(endpoints.auth.refresh).toBe("auth/refresh");
    expect(endpoints.auth.logout).toBe("auth/logout");
    expect(endpoints.auth.confirmEmail).toBe("auth/email/confirm");
    expect(endpoints.auth.resendConfirmation).toBe("auth/email/resend");
    expect(endpoints.auth.deleteAccount).toBe("auth/me");
  });
});
