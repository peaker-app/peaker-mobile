import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { AscentSummaryResponse } from "@/types/api";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

const { AscentCard } = await import("./AscentCard");

const ascent: AscentSummaryResponse = {
  id: "ascent-1",
  peakId: "peak-1",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  ascentDate: "2026-07-20",
  visibility: "Public",
  thumbnailUrl: null,
};

describe("AscentCard", () => {
  it("ascentCard_anyAscent_linksToTheGivenDestination", () => {
    render(<AscentCard ascent={ascent} href="/ascents/ascent-1" />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/ascents/ascent-1",
    );
  });

  it("ascentCard_dateOnly_isParsedAsLocalAndNotShiftedADay", () => {
    render(<AscentCard ascent={ascent} href="/ascents/ascent-1" />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByText(/July 20, 2026/)).toBeInTheDocument();
  });

  it("ascentCard_withoutThumbnail_showsAPlaceholderNotABrokenImage", () => {
    render(<AscentCard ascent={ascent} href="/ascents/ascent-1" />, {
      wrapper: IntlWrapper,
    });

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("ascentCard_withThumbnail_marksItDecorativeBecauseTheNameIsAdjacent", () => {
    render(
      <AscentCard
        ascent={{ ...ascent, thumbnailUrl: "https://img/x.jpg" }}
        href="/ascents/ascent-1"
      />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
      "alt",
      "",
    );
  });

  it("ascentCard_publicScreens_hideTheVisibilityBadge", () => {
    render(<AscentCard ascent={ascent} href="/ascents/ascent-1" />, {
      wrapper: IntlWrapper,
    });

    expect(screen.queryByText("Public")).toBeNull();
  });

  it("ascentCard_ownerScreens_showTheVisibilityBadge", () => {
    render(
      <AscentCard ascent={ascent} href="/ascents/ascent-1" showVisibility />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByText("Public")).toBeInTheDocument();
  });
});
