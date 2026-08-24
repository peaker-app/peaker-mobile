import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { AscentResponse } from "@/types/api";

const replace = vi.fn();
const apiFetch = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/api/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/client")>(
    "@/lib/api/client",
  );

  return { ...actual, apiFetch: (path: string, init?: RequestInit) => apiFetch(path, init) };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { EditAscentForm } = await import("./EditAscentForm");

const ascent: AscentResponse = {
  id: "ascent-1",
  userId: "user-1",
  peakId: "peak-1",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  ascentDate: "2026-07-20",
  companions: "Ana",
  routeNotes: "Vía normal",
  conditions: { snow: "Patchy", wind: null, trail: null },
  visibility: "Private",
  photos: [],
};

const save = () =>
  userEvent.click(screen.getByRole("button", { name: "Save ascent" }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("EditAscentForm", () => {
  it("editAscentForm_peak_isReadOnlyAndExplainsWhy", () => {
    render(<EditAscentForm ascent={ascent} />, { wrapper: IntlWrapper });

    expect(screen.getByText("Aneto").tagName).toBe("OUTPUT");
    expect(
      screen.getByText(
        "To correct the peak, delete this ascent and log it again.",
      ),
    ).toBeInTheDocument();
  });

  it("editAscentForm_peak_isNotADisabledInput", () => {
    const { container } = render(<EditAscentForm ascent={ascent} />, {
      wrapper: IntlWrapper,
    });

    expect(container.querySelector("input[disabled]")).toBeNull();
  });

  it("editAscentForm_save_sendsTheSevenFieldsWithoutPeakId", async () => {
    apiFetch.mockResolvedValue(undefined);
    render(<EditAscentForm ascent={ascent} />, { wrapper: IntlWrapper });

    await save();

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [path, init] = apiFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));

    expect(path).toBe("ascents/ascent-1");
    expect(init.method).toBe("PUT");
    expect(Object.keys(body).sort()).toEqual([
      "ascentDate",
      "companions",
      "routeNotes",
      "snow",
      "trail",
      "visibility",
      "wind",
    ]);
    expect(body).not.toHaveProperty("peakId");
  });

  it("editAscentForm_save_keepsTheVisibilityInsteadOfDefaultingToPublic", async () => {
    apiFetch.mockResolvedValue(undefined);
    render(<EditAscentForm ascent={ascent} />, { wrapper: IntlWrapper });

    await save();

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(JSON.parse(String(init.body)).visibility).toBe("Private");
  });

  it("editAscentForm_emptyText_travelsAsExplicitNull", async () => {
    apiFetch.mockResolvedValue(undefined);
    render(
      <EditAscentForm
        ascent={{ ...ascent, companions: null, routeNotes: null }}
      />,
      { wrapper: IntlWrapper },
    );

    await save();

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, init] = apiFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));

    expect(body.companions).toBeNull();
    expect(body.routeNotes).toBeNull();
  });

  it("editAscentForm_dangerZone_enumeratesWhatIsLost", async () => {
    render(<EditAscentForm ascent={{ ...ascent, photos: [] }} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Delete ascent" }),
    );

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "The ascent will be deleted.",
    );
  });

  it("editAscentForm_deleteConfirmed_callsTheDeleteEndpoint", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<EditAscentForm ascent={ascent} />, { wrapper: IntlWrapper });

    await user.click(screen.getByRole("button", { name: "Delete ascent" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete ascent",
      }),
    );

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("ascents/ascent-1", {
        method: "DELETE",
      }),
    );
  });

  it("editAscentForm_dateInFuture_isShownOnItsField", async () => {
    apiFetch.mockRejectedValue(
      new (await import("@/lib/api/client")).ApiError({
        status: 400,
        title: "Ascent.DateInFuture",
      }),
    );
    render(<EditAscentForm ascent={ascent} />, { wrapper: IntlWrapper });

    await save();

    await waitFor(() =>
      expect(
        screen.getByText("The ascent date can't be in the future."),
      ).toBeInTheDocument(),
    );
  });
});
