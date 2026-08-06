import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { TabBar } from "./TabBar";

const tabBar = () => screen.getByRole("navigation");

describe("TabBar", () => {
  it("tabBar_render_isALabelledLandmark", () => {
    renderWithProviders(<TabBar />);

    expect(tabBar()).toHaveAccessibleName("Main navigation");
  });

  it("tabBar_render_offersTheFiveDestinations", () => {
    renderWithProviders(<TabBar />);

    const links = within(tabBar()).getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/peaks",
      "/dashboard",
      "/dashboard/ascents/new",
      "/dashboard/collections",
      "/dashboard/settings/profile",
    ]);
  });

  it("tabBar_currentRoute_isMarkedForScreenReaders", () => {
    renderWithProviders(<TabBar />, { route: "/dashboard/collections" });

    expect(
      within(tabBar()).getByRole("link", { name: "Collections" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("tabBar_dashboardTab_doesNotMatchItsChildRoutes", () => {
    renderWithProviders(<TabBar />, { route: "/dashboard/collections" });

    expect(
      within(tabBar()).getByRole("link", { name: "My activity" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("tabBar_registerButton_hasAnAccessibleName", () => {
    renderWithProviders(<TabBar />);

    expect(
      within(tabBar()).getByRole("link", { name: "My ascents" }),
    ).toHaveAttribute("href", "/dashboard/ascents/new");
  });

  it("tabBar_arabic_stillRendersEveryDestination", () => {
    renderWithProviders(<TabBar />, { locale: "ar" });

    expect(within(tabBar()).getAllByRole("link")).toHaveLength(5);
  });
});
