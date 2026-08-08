import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { IntlProvider } from "use-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultLocale } from "@/i18n/config";
import { dictionaries } from "@/test/dictionaries";
import { queryClient } from "@/lib/queryClient";
import { jsonResponse } from "@/test/authHarness";
import type {
  CollectionDetailResponse,
  CollectionPeakResponse,
} from "@/types/api";

const { CollectionDetailScreen } = await import("./CollectionDetailScreen");

const aneto: CollectionPeakResponse = {
  id: "row-1",
  peakId: "peak-1",
  peakName: "Aneto",
  peakAltitudeMeters: 3404,
  addedAtUtc: "2026-07-20T10:00:00Z",
};

const posets: CollectionPeakResponse = {
  id: "row-2",
  peakId: "peak-2",
  peakName: "Posets",
  peakAltitudeMeters: 3375,
  addedAtUtc: "2026-07-21T10:00:00Z",
};

const detail = (
  overrides: Partial<CollectionDetailResponse> = {},
  peaks: CollectionPeakResponse[] = [aneto],
): CollectionDetailResponse => ({
  id: "c1",
  name: "Tresmiles",
  description: "Los de los Pirineos.",
  kind: "Custom",
  peakCount: peaks.length,
  peaks: {
    items: peaks,
    page: 1,
    size: 20,
    totalCount: peaks.length,
    totalPages: 1,
  },
  ...overrides,
});

const searchHit = {
  items: [
    {
      id: "peak-2",
      name: "Posets",
      altitudeMeters: 3375,
      countryCode: "ES",
      region: "Aragón",
      imageUrl: null,
    },
  ],
  page: 1,
  size: 8,
  totalCount: 1,
  totalPages: 1,
};

const fetchMock = vi.spyOn(globalThis, "fetch");

const respondWith = (response: Response) => {
  fetchMock.mockImplementation(() => Promise.resolve(response.clone()));
};

const requestedUrls = (): string[] =>
  fetchMock.mock.calls.map((call) => String(call[0]));

const renderScreen = (route = "/dashboard/collections/c1") => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider
      locale={defaultLocale}
      messages={dictionaries[defaultLocale]}
      timeZone="UTC"
    >
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>
  );

  return render(
    <Routes>
      <Route path="/dashboard/collections/:id" element={<CollectionDetailScreen />} />
    </Routes>,
    { wrapper: Wrapper },
  );
};

beforeEach(() => {
  queryClient.clear();
  respondWith(jsonResponse(detail()));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("CollectionDetailScreen", () => {
  it("collectionDetailScreen_loaded_showsTheBreadcrumbHeaderAndPeaks", async () => {
    renderScreen();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Tresmiles" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My collections" })).toBeInTheDocument();

    const peakLinks = screen.getAllByRole("link", { name: "Aneto" });

    for (const link of peakLinks) {
      expect(link).toHaveAttribute("href", "/peaks/peak-1");
    }
  });

  it("collectionDetailScreen_paginatesThePeaksNotTheCollections", async () => {
    renderScreen("/dashboard/collections/c1?page=2");

    await screen.findByRole("heading", { level: 1, name: "Tresmiles" });

    expect(requestedUrls()[0]).toContain("/collections/c1?page=2&size=20");
  });

  it("collectionDetailScreen_defaultCollection_translatesTheNameInTheBreadcrumb", async () => {
    respondWith(
      jsonResponse(detail({ name: "Want to climb", kind: "WantToClimb" })),
    );

    renderScreen();

    const heading = await screen.findByRole("heading", { level: 1 });

    expect(heading).toHaveTextContent("Want to climb");
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("collectionDetailScreen_unknownId_showsNotFoundNotAnError", async () => {
    respondWith(jsonResponse({ title: "Collection.NotFound" }, 404));

    renderScreen();

    expect(await screen.findByText("404")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("collectionDetailScreen_transientFailure_offersRetry", async () => {
    respondWith(jsonResponse({ title: "Boom" }, 503));

    renderScreen();

    expect(
      await screen.findByRole("button", { name: "Try again" }, { timeout: 10_000 }),
    ).toBeInTheDocument();
  }, 15_000);

  it("collectionDetailScreen_refetchAfterAdding_replacesTheOptimisticRowWithTheServerTruth", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    renderScreen();
    await screen.findAllByRole("link", { name: "Aneto" });

    fetchMock.mockImplementation((input, init) => {
      const url = String(input);

      if ((init as RequestInit | undefined)?.method === "POST") {
        return Promise.resolve(jsonResponse(posets, 201));
      }

      if (url.includes("/peaks/search")) {
        return Promise.resolve(jsonResponse(searchHit));
      }

      return Promise.resolve(jsonResponse(detail({}, [posets, aneto])));
    });

    await user.click(screen.getByRole("button", { name: "Add a peak" }));
    await user.type(screen.getByLabelText("Search a peak"), "posets");
    await user.click(await screen.findByRole("option", { name: /Posets/ }));

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: "Posets" })).toHaveLength(2);
    });

    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Posets");
    expect(rows[1]).toHaveTextContent("Aneto");
  });
});
