import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/en.json";
import { ApiError } from "@/lib/api/client";

const apiFetch = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
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

const { AddToCollectionDialog } = await import("./AddToCollectionDialog");

const Wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
);

const mine = {
  items: [
    { id: "c0", name: "Want to climb", description: null, kind: "WantToClimb", peakCount: 3 },
    { id: "c1", name: "Tresmiles", description: null, kind: "Custom", peakCount: 1 },
  ],
  page: 1,
  size: 100,
  totalCount: 2,
  totalPages: 1,
};

const routeApiFetch = (onWrite: () => Promise<unknown>) => {
  apiFetch.mockImplementation((path: string) =>
    path.startsWith("collections?") ? Promise.resolve(mine) : onWrite(),
  );
};

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Add to a collection" }));

  return screen.getByRole("dialog");
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("AddToCollectionDialog", () => {
  it("addToCollectionDialog_listsTheCollectionsTranslatingTheDefaultOne", async () => {
    routeApiFetch(() => Promise.resolve(undefined));
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<AddToCollectionDialog peakId="peak-aneto" />, { wrapper: Wrapper });

    const dialog = await open(user);

    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Want to climb" }),
      ).toBeInTheDocument(),
    );
    expect(within(dialog).getByRole("button", { name: "Tresmiles" })).toBeInTheDocument();
  });

  it("addToCollectionDialog_doesNotFetchUntilItOpens", () => {
    routeApiFetch(() => Promise.resolve(undefined));
    render(<AddToCollectionDialog peakId="peak-aneto" />, { wrapper: Wrapper });

    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("addToCollectionDialog_choosingOne_postsThePeakToIt", async () => {
    routeApiFetch(() => Promise.resolve(undefined));
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<AddToCollectionDialog peakId="peak-aneto" />, { wrapper: Wrapper });

    const dialog = await open(user);
    await user.click(await within(dialog).findByRole("button", { name: "Tresmiles" }));

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("collections/c1/peaks", {
        method: "POST",
        body: JSON.stringify({ peakId: "peak-aneto" }),
      }),
    );
    expect(within(dialog).getByRole("status")).toHaveTextContent("Added to Tresmiles.");
  });

  it("addToCollectionDialog_alreadyThere_isANeutralNoticeNotAnError", async () => {
    routeApiFetch(() =>
      Promise.reject(new ApiError({ status: 409, title: "Collection.PeakAlreadyAdded" })),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<AddToCollectionDialog peakId="peak-aneto" />, { wrapper: Wrapper });

    const dialog = await open(user);
    await user.click(await within(dialog).findByRole("button", { name: "Tresmiles" }));

    await waitFor(() =>
      expect(within(dialog).getByRole("status")).toHaveTextContent(
        "It was already in Tresmiles.",
      ),
    );
    expect(within(dialog).queryByRole("alert")).toBeNull();
  });

  it("addToCollectionDialog_otherFailures_areReportedAsErrors", async () => {
    routeApiFetch(() =>
      Promise.reject(
        new ApiError({ status: 503, title: "Collection.PeakCatalogUnavailable" }),
      ),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<AddToCollectionDialog peakId="peak-aneto" />, { wrapper: Wrapper });

    const dialog = await open(user);
    await user.click(await within(dialog).findByRole("button", { name: "Tresmiles" }));

    await waitFor(() =>
      expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "The peak catalogue isn't responding. Try again in a moment.",
      ),
    );
  });

  it("addToCollectionDialog_withoutCollections_saysSoInsteadOfShowingAnEmptyBox", async () => {
    apiFetch.mockResolvedValue({ ...mine, items: [], totalCount: 0, totalPages: 0 });
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<AddToCollectionDialog peakId="peak-aneto" />, { wrapper: Wrapper });

    const dialog = await open(user);

    await waitFor(() =>
      expect(
        within(dialog).getByText("You don't have any collection yet."),
      ).toBeInTheDocument(),
    );
  });
});
