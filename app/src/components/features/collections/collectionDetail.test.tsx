import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/en.json";
import { ApiError } from "@/lib/api/client";
import type {
  CollectionPeakResponse,
  CollectionSummaryResponse,
  PagedResponse,
} from "@/types/api";

const apiFetch = vi.fn();
const refresh = vi.fn();
const push = vi.fn();
const replace = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh, push, replace }),
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/api/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/client")>(
    "@/lib/api/client",
  );

  return { ...actual, apiFetch: (path: string, init?: RequestInit) => apiFetch(path, init) };
});

vi.mock("sonner", () => ({
  toast: { success: (m: string) => toastSuccess(m), error: (m: string) => toastError(m) },
}));

const { CollectionHeader } = await import("./CollectionHeader");
const { CollectionPeaksSection } = await import("./CollectionPeaksSection");

const Wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
);

const custom: CollectionSummaryResponse = {
  id: "c1",
  name: "Tresmiles",
  description: "Los de los Pirineos.",
  kind: "Custom",
  peakCount: 2,
};

const wantToClimb: CollectionSummaryResponse = {
  ...custom,
  id: "c0",
  name: "Want to climb",
  kind: "WantToClimb",
};

const aneto: CollectionPeakResponse = {
  id: "p1",
  peakId: "peak-aneto",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  addedAtUtc: "2026-07-20T10:00:00Z",
};

const posets: CollectionPeakResponse = {
  id: "p2",
  peakId: "peak-posets",
  peakName: "Posets",
  peakAltitudeMeters: 3375,
  addedAtUtc: "2026-07-19T10:00:00Z",
};

const peakPage = (
  items: CollectionPeakResponse[],
  page = 1,
): PagedResponse<CollectionPeakResponse> => ({
  items,
  page,
  size: 20,
  totalCount: items.length,
  totalPages: 1,
});

const searchResults = [
  { id: "peak-perdido", name: "Monte Perdido", altitudeMeters: 3355, countryCode: "ES", region: null },
  { id: "peak-aneto", name: "Aneto", altitudeMeters: 3404, countryCode: "ES", region: null },
];

const routeApiFetch = (onWrite: (path: string) => Promise<unknown>) => {
  apiFetch.mockImplementation((path: string) =>
    path.startsWith("peaks/search")
      ? Promise.resolve({ items: searchResults, page: 1, size: 10, totalCount: 2, totalPages: 1 })
      : onWrite(path),
  );
};

const pickFromTheDialog = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) => {
  await user.click(screen.getByRole("button", { name: "Add a peak" }));
  await user.type(screen.getByLabelText("Search a peak"), "pico");

  const option = await screen.findByRole("option", { name: new RegExp(name) });
  await user.click(option);

  return option;
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("CollectionHeader", () => {
  it("collectionHeader_custom_offersEditAndDelete", () => {
    render(<CollectionHeader collection={custom} />, { wrapper: Wrapper });

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("collectionHeader_default_paintsNeitherEditNorDelete", () => {
    render(<CollectionHeader collection={wantToClimb} />, { wrapper: Wrapper });

    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("collectionHeader_default_isDetectedByKindNotByName", () => {
    render(
      <CollectionHeader collection={{ ...wantToClimb, name: "Mi lista" }} />,
      { wrapper: Wrapper },
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Want to climb",
    );
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("collectionHeader_delete_asksForConfirmationFirst", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CollectionHeader collection={custom} />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Your ascents and the peak catalogue are not affected",
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("collectionHeader_deleteConfirmed_callsTheApiAndGoesBackToTheList", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CollectionHeader collection={custom} />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete collection",
      }),
    );

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("collections/c1", { method: "DELETE" }),
    );
    expect(replace).toHaveBeenCalledWith("/dashboard/collections");
  });
});

describe("CollectionPeaksSection", () => {
  it("collectionPeaksSection_rendersTheServerOrderWithTheNewestFirst", () => {
    render(
      <CollectionPeaksSection collectionId="c1" page={peakPage([aneto, posets])} />,
      { wrapper: Wrapper },
    );

    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);

    expect(rows[0]).toHaveTextContent("Aneto");
    expect(rows[1]).toHaveTextContent("Posets");
  });

  it("collectionPeaksSection_addingAPeak_putsItFirstAndBumpsTheCount", async () => {
    const added: CollectionPeakResponse = {
      id: "p3",
      peakId: "peak-perdido",
      peakName: "Monte Perdido",
      peakAltitudeMeters: 3355,
      addedAtUtc: "2026-07-21T10:00:00Z",
    };
    routeApiFetch(() => Promise.resolve(added));
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <CollectionPeaksSection collectionId="c1" page={peakPage([aneto, posets])} />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText("2 peaks")).toBeInTheDocument();

    await pickFromTheDialog(user, "Monte Perdido");

    await waitFor(() => expect(screen.getByText("3 peaks")).toBeInTheDocument());
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Monte Perdido");
  });

  it("collectionPeaksSection_peaksAlreadyInTheCollection_areNotSelectable", async () => {
    routeApiFetch(() => Promise.resolve(undefined));
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CollectionPeaksSection collectionId="c1" page={peakPage([aneto])} />, {
      wrapper: Wrapper,
    });

    await user.click(screen.getByRole("button", { name: "Add a peak" }));
    await user.type(screen.getByLabelText("Search a peak"), "pico");

    const present = await screen.findByRole("option", { name: /Aneto/ });
    expect(present).toHaveAttribute("aria-disabled", "true");
    expect(present).toHaveTextContent("Already in this collection");

    await user.click(present);

    expect(
      apiFetch.mock.calls.filter(([path]) => String(path).includes("collections")),
    ).toHaveLength(0);
  });

  it("collectionPeaksSection_removingAPeak_doesNotAskForConfirmation", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <CollectionPeaksSection collectionId="c1" page={peakPage([aneto, posets])} />,
      { wrapper: Wrapper },
    );

    await user.click(
      screen.getAllByRole("button", { name: "Remove Aneto from the collection" })[0]!,
    );

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("collections/c1/peaks/peak-aneto", {
        method: "DELETE",
      }),
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
    await waitFor(() => expect(screen.getByText("1 peak")).toBeInTheDocument());
  });

  it("collectionPeaksSection_removeButton_namesThePeakItRemoves", () => {
    render(
      <CollectionPeaksSection collectionId="c1" page={peakPage([aneto, posets])} />,
      { wrapper: Wrapper },
    );

    expect(
      screen.getAllByRole("button", { name: "Remove Posets from the collection" }),
    ).not.toHaveLength(0);
  });

  it("collectionPeaksSection_empty_showsAnEmptyStateNotAnError", () => {
    render(<CollectionPeaksSection collectionId="c1" page={peakPage([])} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText("This collection has no peaks yet.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("collectionPeaksSection_serverRejectsTheAdd_reportsItInsideTheDialog", async () => {
    routeApiFetch(() =>
      Promise.reject(new ApiError({ status: 409, title: "Collection.PeakAlreadyAdded" })),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CollectionPeaksSection collectionId="c1" page={peakPage([posets])} />, {
      wrapper: Wrapper,
    });

    await pickFromTheDialog(user, "Monte Perdido");

    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "That peak is already in this collection.",
      ),
    );
  });
});

