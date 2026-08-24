import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { ApiError } from "@/lib/api/client";
import type { CollectionSummaryResponse, PagedResponse } from "@/types/api";

const apiFetch = vi.fn();
const refresh = vi.fn();
const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh, push, replace: vi.fn() }),
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

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { CollectionCard } = await import("./CollectionCard");
const { CollectionsGrid } = await import("./CollectionsGrid");
const { CollectionDialog } = await import("./CollectionDialog");
const { DialogTrigger } = await import("@/components/ui/Dialog");
const { Button } = await import("@/components/ui/Button");

const defaultCollection: CollectionSummaryResponse = {
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

const openCreateDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  render(
    <CollectionDialog
      idPrefix="createCollection"
      title="New collection"
      submitLabel="Create collection"
      trigger={
        <DialogTrigger asChild>
          <Button>New collection</Button>
        </DialogTrigger>
      }
    />,
    { wrapper: IntlWrapper },
  );

  await user.click(screen.getByRole("button", { name: "New collection" }));

  return screen.getByRole("dialog");
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("CollectionCard", () => {
  it("collectionCard_default_showsTheTranslatedNameNotTheStoredOne", () => {
    render(<CollectionCard collection={defaultCollection} />, { wrapper: IntlWrapper });

    expect(screen.getByRole("link", { name: "Want to climb" })).toBeInTheDocument();
  });

  it("collectionCard_default_isDetectedByKindNotByName", () => {
    render(
      <CollectionCard collection={{ ...defaultCollection, name: "Otra cosa" }} />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByRole("link", { name: "Want to climb" })).toBeInTheDocument();
    expect(screen.queryByText("Otra cosa")).toBeNull();
  });

  it("collectionCard_customNamedLikeTheDefault_isNotBadged", () => {
    render(
      <CollectionCard collection={{ ...custom, name: "Want to climb" }} />,
      { wrapper: IntlWrapper },
    );

    expect(screen.queryByText("Default")).toBeNull();
  });

  it("collectionCard_default_carriesATextBadgeNotOnlyAColour", () => {
    render(<CollectionCard collection={defaultCollection} />, { wrapper: IntlWrapper });

    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("collectionCard_reportsThePeakCount", () => {
    render(<CollectionCard collection={custom} />, { wrapper: IntlWrapper });

    expect(screen.getByText("1 peak")).toBeInTheDocument();
  });

  it("collectionCard_withoutPeaks_saysSoInsteadOfShowingAZero", () => {
    render(<CollectionCard collection={{ ...custom, peakCount: 0 }} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByText("No peaks")).toBeInTheDocument();
  });
});

describe("CollectionsGrid", () => {
  it("collectionsGrid_rendersTheServerOrderWithoutReordering", () => {
    render(<CollectionsGrid collections={paged([defaultCollection, custom])} />, {
      wrapper: IntlWrapper,
    });

    const names = screen.getAllByRole("listitem").map((item) => item.textContent);

    expect(names[0]).toContain("Want to climb");
    expect(names[1]).toContain("Tresmiles");
  });

  it("collectionsGrid_isAList", () => {
    render(<CollectionsGrid collections={paged([custom])} />, { wrapper: IntlWrapper });

    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("CollectionDialog", () => {
  it("collectionDialog_create_postsNameAndDescription", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const dialog = await openCreateDialog(user);

    await user.type(within(dialog).getByLabelText("Name"), "Tresmiles");
    await user.type(within(dialog).getByLabelText("Description"), "Los Pirineos.");
    await user.click(within(dialog).getByRole("button", { name: "Create collection" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [path, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(path).toBe("collections");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      name: "Tresmiles",
      description: "Los Pirineos.",
    });
  });

  it("collectionDialog_emptyDescription_travelsAsExplicitNull", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const dialog = await openCreateDialog(user);

    await user.type(within(dialog).getByLabelText("Name"), "Tresmiles");
    await user.click(within(dialog).getByRole("button", { name: "Create collection" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(JSON.parse(String(init.body)).description).toBeNull();
  });

  it("collectionDialog_blankName_isRejectedBeforeCallingTheApi", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const dialog = await openCreateDialog(user);

    await user.click(within(dialog).getByRole("button", { name: "Create collection" }));

    await waitFor(() =>
      expect(within(dialog).getByText("Enter a name.")).toBeInTheDocument(),
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("collectionDialog_duplicateName_isShownOnItsOwnField", async () => {
    apiFetch.mockRejectedValue(
      new ApiError({ status: 409, title: "Collection.NameAlreadyUsed" }),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const dialog = await openCreateDialog(user);

    await user.type(within(dialog).getByLabelText("Name"), "Tresmiles");
    await user.click(within(dialog).getByRole("button", { name: "Create collection" }));

    await waitFor(() =>
      expect(
        within(dialog).getByText("You already have a collection with that name."),
      ).toBeInTheDocument(),
    );
    expect(within(dialog).getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
  });

  it("collectionDialog_edit_putsToTheCollectionEndpoint", async () => {
    apiFetch.mockResolvedValue(undefined);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <CollectionDialog
        idPrefix="editCollection"
        collectionId="c1"
        title="Edit collection"
        submitLabel="Save changes"
        initial={{ name: "Tresmiles", description: "Los de los Pirineos." }}
        trigger={
          <DialogTrigger asChild>
            <Button>Edit</Button>
          </DialogTrigger>
        }
      />,
      { wrapper: IntlWrapper },
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [path, init] = apiFetch.mock.calls[0] as [string, RequestInit];

    expect(path).toBe("collections/c1");
    expect(init.method).toBe("PUT");
  });
});
