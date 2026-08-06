import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

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

const { PeakCard, placeLabel } = await import("./PeakCard");

const aneto = {
  id: "peak-1",
  name: "Aneto",
  altitudeMeters: 3404,
  countryCode: "ES",
  region: "Pyrenees",
};

describe("PeakCard", () => {
  it("peakCard_anyPeak_linksToItsDetailScreen", () => {
    render(<PeakCard peak={aneto} />, { wrapper: IntlWrapper });

    expect(screen.getByRole("link")).toHaveAttribute("href", "/peaks/peak-1");
  });

  it("peakCard_link_carriesNameAndAltitudeInItsAccessibleName", () => {
    render(<PeakCard peak={aneto} />, { wrapper: IntlWrapper });

    expect(
      screen.getByRole("link", { name: "Aneto, 3,404 metres" }),
    ).toBeInTheDocument();
  });

  it("peakCard_withoutDistance_hidesTheDistanceLine", () => {
    render(<PeakCard peak={aneto} />, { wrapper: IntlWrapper });

    expect(screen.queryByText(/away/)).toBeNull();
  });

  it("peakCard_withDistanceUnderOneKilometre_showsMetres", () => {
    render(<PeakCard peak={{ ...aneto, distanceMeters: 850 }} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByText("850 m away")).toBeInTheDocument();
  });

  it("peakCard_withDistanceOverOneKilometre_showsKilometres", () => {
    render(<PeakCard peak={{ ...aneto, distanceMeters: 12340 }} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByText("12.3 km away")).toBeInTheDocument();
  });

  it("peakCard_withoutPhoto_keepsTheDefaultIcon", () => {
    const { container } = render(<PeakCard peak={aneto} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("peakCard_withPhoto_showsADecorativeThumbnail", () => {
    render(
      <PeakCard
        peak={{
          ...aneto,
          imageUrl:
            "https://commons.wikimedia.org/wiki/Special:FilePath/Aneto.jpg",
        }}
      />,
      { wrapper: IntlWrapper },
    );

    const photo = screen.getByAltText("");

    expect(photo).toHaveAttribute(
      "src",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Aneto.jpg?width=128",
    );
  });

  it("peakCard_nameIsAWikidataIdentifier_showsThePlaceholderInstead", () => {
    render(<PeakCard peak={{ ...aneto, name: "Q8538208" }} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("link")).toHaveTextContent(
      "Unnamed peak (Q8538208)",
    );
    expect(screen.queryByText("Q8538208")).toBeNull();
  });

  it("peakCard_oddButRealName_isShownUntouched", () => {
    render(<PeakCard peak={{ ...aneto, name: "image1" }} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("link")).toHaveTextContent("image1");
  });
});

describe("placeLabel", () => {
  it("placeLabel_regionAndCountry_areJoined", () => {
    expect(placeLabel("en", "ES", "Pyrenees")).toBe("Pyrenees, Spain");
  });

  it("placeLabel_countryOnly_omitsTheSeparator", () => {
    expect(placeLabel("en", "ES", null)).toBe("Spain");
  });

  it("placeLabel_nothingKnown_returnsUndefined", () => {
    expect(placeLabel("en", null, null)).toBeUndefined();
  });
});
