import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { AscentPhotoResponse } from "@/types/api";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

const { PhotoGallery } = await import("./PhotoGallery");

const photo = (id: string, position: number): AscentPhotoResponse => ({
  id,
  secureUrl: `https://img/${id}.jpg`,
  width: 1200,
  height: 900,
  position,
  uploadedAtUtc: "2026-07-20T10:00:00Z",
});

const photos = [photo("a", 0), photo("b", 1), photo("c", 2)];

describe("PhotoGallery", () => {
  it("photoGallery_noPhotos_rendersNothing", () => {
    const { container } = render(
      <PhotoGallery photos={[]} peakName="Aneto" />,
      { wrapper: IntlWrapper },
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("photoGallery_photos_haveGeneratedAlternativeText", () => {
    render(<PhotoGallery photos={photos} peakName="Aneto" />, {
      wrapper: IntlWrapper,
    });

    expect(
      screen.getByAltText("Photo 1 of the ascent of Aneto"),
    ).toBeInTheDocument();
  });

  it("photoGallery_thumbnails_areLabelledButtons", () => {
    render(<PhotoGallery photos={photos} peakName="Aneto" />, {
      wrapper: IntlWrapper,
    });

    expect(
      screen.getByRole("button", { name: "Open photo 2" }),
    ).toBeInTheDocument();
  });

  it("photoGallery_thumbnailClicked_opensAModalLightbox", async () => {
    render(<PhotoGallery photos={photos} peakName="Aneto" />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Open photo 1" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("photoGallery_nextInLightbox_advancesAndWrapsAround", async () => {
    render(<PhotoGallery photos={photos} peakName="Aneto" />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Open photo 3" }));
    await userEvent.click(screen.getByRole("button", { name: "Next photo" }));

    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("photoGallery_singlePhoto_disablesNavigation", async () => {
    render(<PhotoGallery photos={[photo("a", 0)]} peakName="Aneto" />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Open photo 1" }));

    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
  });
});
