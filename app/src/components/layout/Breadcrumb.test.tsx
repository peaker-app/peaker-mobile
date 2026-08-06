import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const { Breadcrumb } = await import("./Breadcrumb");

describe("Breadcrumb", () => {
  it("breadcrumb_anySteps_alwaysStartsAtHome", () => {
    render(<Breadcrumb steps={[{ label: "Aneto" }]} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("breadcrumb_lastStep_isMarkedAsTheCurrentPage", () => {
    render(
      <Breadcrumb steps={[{ label: "Peaks", href: "/peaks" }, { label: "Aneto" }]} />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByText("Aneto")).toHaveAttribute("aria-current", "page");
  });

  it("breadcrumb_intermediateSteps_areLinks", () => {
    render(
      <Breadcrumb steps={[{ label: "Peaks", href: "/peaks" }, { label: "Aneto" }]} />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByRole("link", { name: "Peaks" })).toHaveAttribute(
      "href",
      "/peaks",
    );
  });

  it("breadcrumb_navigation_hasAnAccessibleName", () => {
    render(<Breadcrumb steps={[{ label: "Aneto" }]} />, {
      wrapper: IntlWrapper,
    });

    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });
});
