import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/en.json";
import { ApiError } from "@/lib/api/client";

const replace = vi.fn();
const submitAscent = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/ascents/submitAscent", () => ({
  submitAscent: (options: unknown) => submitAscent(options),
}));

const { RegisterAscentForm } = await import("./RegisterAscentForm");
const { useEmailConfirmation } = await import("@/stores/emailConfirmation");

const Wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
);

const peak = { id: "peak-1", name: "Aneto", altitudeMeters: 3404 };

const save = () =>
  userEvent.click(screen.getByRole("button", { name: "Save ascent" }));

const captureUncaughtErrors = () => {
  const reported: string[] = [];

  const listener = (event: ErrorEvent) => {
    reported.push(String(event.error ?? event.message));
    event.preventDefault();
  };

  window.addEventListener("error", listener);
  cleanUpUncaughtErrors = () => window.removeEventListener("error", listener);

  return { reported };
};

let cleanUpUncaughtErrors = () => undefined as void;

const stubShowPicker = (implementation: () => void) => {
  Object.defineProperty(HTMLInputElement.prototype, "showPicker", {
    value: implementation,
    configurable: true,
    writable: true,
  });
};

beforeEach(() => {
  useEmailConfirmation.setState({ unconfirmed: false });
});

afterEach(() => {
  cleanUpUncaughtErrors();
  delete (HTMLInputElement.prototype as { showPicker?: unknown }).showPicker;
  vi.clearAllMocks();
});

describe("RegisterAscentForm", () => {
  it("registerAscent_withoutPeak_isRejectedBeforeCallingTheApi", async () => {
    render(<RegisterAscentForm />, { wrapper: Wrapper });

    await save();

    await waitFor(() =>
      expect(
        screen.getByText("That peak is no longer in the catalogue."),
      ).toBeInTheDocument(),
    );
    expect(submitAscent).not.toHaveBeenCalled();
  });

  it("registerAscent_preselectedPeak_arrivesAlreadyChosen", () => {
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    expect(screen.getByText("Selected: Aneto")).toBeInTheDocument();
  });

  it("registerAscent_success_navigatesToTheDetail", async () => {
    submitAscent.mockResolvedValue({ ascentId: "ascent-1", failedPhotos: 0 });
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await save();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/dashboard/ascents/ascent-1"),
    );
  });

  it("registerAscent_partialPhotoFailure_stillGoesToTheDetailWithTheNotice", async () => {
    submitAscent.mockResolvedValue({ ascentId: "ascent-1", failedPhotos: 2 });
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await save();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/dashboard/ascents/ascent-1?photosFailed=2",
      ),
    );
  });

  it("registerAscent_emptyText_travelsAsExplicitNull", async () => {
    submitAscent.mockResolvedValue({ ascentId: "ascent-1", failedPhotos: 0 });
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await save();

    await waitFor(() => expect(submitAscent).toHaveBeenCalled());
    const [call] = submitAscent.mock.calls as [
      [{ request: Record<string, unknown> }],
    ];
    const { request } = call[0];

    expect(request.companions).toBeNull();
    expect(request.routeNotes).toBeNull();
    expect(request.visibility).toBe("Public");
  });

  it("registerAscent_date_isSentAsDateOnlyWithoutTime", async () => {
    submitAscent.mockResolvedValue({ ascentId: "ascent-1", failedPhotos: 0 });
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await save();

    await waitFor(() => expect(submitAscent).toHaveBeenCalled());
    const [call] = submitAscent.mock.calls as [
      [{ request: { ascentDate: string } }],
    ];
    const { request } = call[0];

    expect(request.ascentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("registerAscent_dateFieldFocused_opensTheNativePicker", async () => {
    const showPicker = vi.fn();
    stubShowPicker(showPicker);
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await userEvent.click(screen.getByLabelText("Ascent date"));

    expect(showPicker).toHaveBeenCalledTimes(1);
  });

  it("registerAscent_pickerBlockedByTheBrowser_raisesNothingAndKeepsTheFieldUsable", async () => {
    stubShowPicker(() => {
      throw new DOMException("blocked", "NotAllowedError");
    });
    submitAscent.mockResolvedValue({ ascentId: "ascent-1", failedPhotos: 0 });
    const uncaught = captureUncaughtErrors();
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    const field = screen.getByLabelText("Ascent date");
    await userEvent.click(field);
    await userEvent.clear(field);
    await userEvent.type(field, "2026-07-20");
    await save();

    await waitFor(() => expect(submitAscent).toHaveBeenCalled());
    const [call] = submitAscent.mock.calls as [
      [{ request: { ascentDate: string } }],
    ];

    expect(uncaught.reported).toEqual([]);
    expect(call[0].request.ascentDate).toBe("2026-07-20");
  });

  it("registerAscent_emailNotConfirmed_keepsTheFormAndOffersResendAndRetry", async () => {
    submitAscent.mockRejectedValue(
      new ApiError({ status: 403, title: "Ascent.EmailNotConfirmed" }),
    );
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText("Companions"), "Ana");
    await save();

    await waitFor(() =>
      expect(
        screen.getByText("Confirm your email before logging an ascent"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Companions")).toHaveValue("Ana");
    expect(
      screen.getByRole("link", { name: "Send me the link again" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("registerAscent_emailNotConfirmed_remembersItForTheDashboardBanner", async () => {
    submitAscent.mockRejectedValue(
      new ApiError({ status: 403, title: "Ascent.EmailNotConfirmed" }),
    );
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await save();

    await waitFor(() =>
      expect(useEmailConfirmation.getState().unconfirmed).toBe(true),
    );
  });

  it("registerAscent_catalogueUnavailable_offersToRetryKeepingTheForm", async () => {
    submitAscent.mockRejectedValue(
      new ApiError({ status: 503, title: "Ascent.PeakCatalogUnavailable" }),
    );
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await save();

    await waitFor(() =>
      expect(
        screen.getByText("The peak catalogue isn't responding"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("Selected: Aneto")).toBeInTheDocument();
  });

  it("registerAscent_dateInFuture_isShownOnItsField", async () => {
    submitAscent.mockRejectedValue(
      new ApiError({ status: 400, title: "Ascent.DateInFuture" }),
    );
    render(<RegisterAscentForm preselectedPeak={peak} />, { wrapper: Wrapper });

    await save();

    await waitFor(() =>
      expect(
        screen.getByText("The ascent date can't be in the future."),
      ).toBeInTheDocument(),
    );
  });
});
