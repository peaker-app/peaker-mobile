import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/authHarness";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { CollectionSummaryResponse, PagedResponse } from "@/types/api";

const { CollectionsScreen } = await import("./CollectionsScreen");

const wantToClimb: CollectionSummaryResponse = {
  id: "c0",
  name: "Want to climb",
  description: null,
  kind: "WantToClimb",
  peakCount: 4,
};

const custom: CollectionSummaryResponse = {
  id: "c1",
  name: "Tresmiles",
  description: "Los de los Pirineos.",
  kind: "Custom",
  peakCount: 1,
};

const paged = (
  items: CollectionSummaryResponse[],
): PagedResponse<CollectionSummaryResponse> => ({
  items,
  page: 1,
  size: 20,
  totalCount: items.length,
  totalPages: 1,
});

const fetchMock = vi.spyOn(globalThis, "fetch");

const respondWith = (response: Response) => {
  fetchMock.mockImplementation(() => Promise.resolve(response.clone()));
};

const requestedUrls = (): string[] =>
  fetchMock.mock.calls.map((call) => String(call[0]));

beforeEach(() => {
  respondWith(jsonResponse(paged([wantToClimb, custom])));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("CollectionsScreen", () => {
  it("collectionsScreen_loaded_keepsTheServerOrderWithTheDefaultFirst", async () => {
    renderWithProviders(<CollectionsScreen />, {
      route: "/dashboard/collections",
    });

    await screen.findByText("Tresmiles");
    const items = screen.getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("Want to climb");
    expect(items[1]).toHaveTextContent("Tresmiles");
  });

  it("collectionsScreen_asksForTwentyPerPage", async () => {
    renderWithProviders(<CollectionsScreen />, {
      route: "/dashboard/collections",
    });

    await screen.findByText("Tresmiles");

    expect(requestedUrls()[0]).toContain("/collections?page=1&size=20");
  });

  it("collectionsScreen_pageParam_isForwardedToTheGateway", async () => {
    renderWithProviders(<CollectionsScreen />, {
      route: "/dashboard/collections?page=3",
    });

    await screen.findByText("Tresmiles");

    expect(requestedUrls()[0]).toContain("page=3");
  });

  it("collectionsScreen_empty_showsTheEmptyStateAndStillOffersToCreate", async () => {
    respondWith(jsonResponse(paged([])));

    renderWithProviders(<CollectionsScreen />, {
      route: "/dashboard/collections",
    });

    expect(
      await screen.findByText("You haven't created a collection yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New collection" }),
    ).toBeInTheDocument();
  });

  it("collectionsScreen_loadFails_hidesTheCreateButton", async () => {
    respondWith(jsonResponse({ title: "Boom", status: 500 }, 500));

    renderWithProviders(<CollectionsScreen />, {
      route: "/dashboard/collections",
    });

    expect(
      await screen.findByRole("alert", {}, { timeout: 10_000 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "New collection" }),
    ).not.toBeInTheDocument();
  }, 15_000);

  it("collectionsScreen_pageOutOfRange_takesTheUserBackToTheFirstPage", async () => {
    respondWith(jsonResponse({ title: "Pagination.PageOutOfRange" }, 400));

    renderWithProviders(<CollectionsScreen />, {
      route: "/dashboard/collections?page=99",
    });

    const retry = await screen.findByRole("button", { name: "Try again" });

    respondWith(jsonResponse(paged([wantToClimb])));
    await userEvent.click(retry);

    expect(await screen.findByText("Want to climb")).toBeInTheDocument();
  });

  it("collectionsScreen_create_postsToTheCollectionsEndpoint", async () => {
    renderWithProviders(<CollectionsScreen />, {
      route: "/dashboard/collections",
    });

    await userEvent.click(
      await screen.findByRole("button", { name: "New collection" }),
    );
    await userEvent.type(screen.getByLabelText(/Name/), "Tresmiles");
    await userEvent.click(
      screen.getByRole("button", { name: "Create collection" }),
    );

    const post = fetchMock.mock.calls.find(
      (call) => (call[1] as RequestInit | undefined)?.method === "POST",
    );

    expect(String(post?.[0])).toContain("/collections");
  });
});
