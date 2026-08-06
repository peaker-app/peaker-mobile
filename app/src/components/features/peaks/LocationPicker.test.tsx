import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LocateOutcome } from "@/lib/native/geolocation";
import { IntlWrapper } from "@/test/IntlWrapper";

const locate = vi.fn<() => Promise<LocateOutcome>>();

vi.mock("@/lib/native/geolocation", () => ({
  locator: { locate: () => locate() },
}));

const { LocationPicker } = await import("./LocationPicker");

afterEach(() => {
  vi.clearAllMocks();
});

describe("LocationPicker", () => {
  it("locationPicker_onMount_neverAsksForPermission", () => {
    render(<LocationPicker onChange={() => undefined} />, {
      wrapper: IntlWrapper,
    });

    expect(locate).not.toHaveBeenCalled();
  });

  it("locationPicker_buttonPressed_asksForPermissionAndReportsThePosition", async () => {
    const onChange = vi.fn();
    locate.mockResolvedValue({
      status: "located",
      latitude: 42.64,
      longitude: 0.65,
    });

    render(<LocationPicker onChange={onChange} />, { wrapper: IntlWrapper });
    await userEvent.click(
      screen.getByRole("button", { name: "Use my location" }),
    );

    expect(locate).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ latitude: 42.64, longitude: 0.65 });
  });

  it("locationPicker_permissionDenied_offersManualEntryWithoutBlocking", async () => {
    locate.mockResolvedValue({ status: "denied" });

    render(<LocationPicker onChange={() => undefined} />, {
      wrapper: IntlWrapper,
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Use my location" }),
    );

    expect(
      screen.getByText(
        "We couldn't get your location. Enter the coordinates by hand.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Latitude")).toBeEnabled();
  });

  it("locationPicker_withoutGeolocationSupport_explainsAndFallsBack", async () => {
    locate.mockResolvedValue({ status: "unsupported" });

    render(<LocationPicker onChange={() => undefined} />, {
      wrapper: IntlWrapper,
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Use my location" }),
    );

    expect(
      screen.getByText(
        "This browser can't share your location. Enter the coordinates by hand.",
      ),
    ).toBeInTheDocument();
  });

  it("locationPicker_manualCoordinates_areSubmitted", async () => {
    const onChange = vi.fn();
    render(<LocationPicker onChange={onChange} />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByLabelText("Latitude"), "42.64");
    await userEvent.type(screen.getByLabelText("Longitude"), "0.65");
    await userEvent.click(screen.getByRole("button", { name: "Search here" }));

    expect(onChange).toHaveBeenCalledWith({ latitude: 42.64, longitude: 0.65 });
  });

  it("locationPicker_latitudeOutOfRange_isRejectedBeforeCallingTheApi", async () => {
    const onChange = vi.fn();
    render(<LocationPicker onChange={onChange} />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByLabelText("Latitude"), "120");
    await userEvent.type(screen.getByLabelText("Longitude"), "0.65");

    expect(screen.getByLabelText("Latitude")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("button", { name: "Search here" })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("locationPicker_longitudeOutOfRange_isRejectedBeforeCallingTheApi", async () => {
    render(<LocationPicker onChange={() => undefined} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.type(screen.getByLabelText("Longitude"), "200");

    expect(screen.getByLabelText("Longitude")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("locationPicker_coordinateFields_areLeftToRightEvenInRtl", () => {
    render(<LocationPicker onChange={() => undefined} />, {
      wrapper: ({ children }) => (
        <IntlWrapper locale="ar">{children}</IntlWrapper>
      ),
    });

    expect(screen.getByLabelText("خط العرض")).toHaveAttribute("dir", "ltr");
  });
});
