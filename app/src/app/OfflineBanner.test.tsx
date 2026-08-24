import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";

const online = vi.fn(() => true);

vi.mock("@/lib/offline/connectivity", () => ({
  useIsOnline: () => online(),
}));

const { OfflineBanner } = await import("./OfflineBanner");

describe("OfflineBanner", () => {
  it("offlineBanner_online_rendersNothing", () => {
    online.mockReturnValue(true);

    const { container } = renderWithProviders(<OfflineBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it("offlineBanner_offline_announcesItWithARoleStatus", () => {
    online.mockReturnValue(false);

    renderWithProviders(<OfflineBanner />);

    expect(screen.getByRole("status")).toHaveTextContent("You're offline.");
  });
});
