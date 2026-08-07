import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import type { AscentSummaryResponse, PagedResponse } from "@/types/api";

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

const { AscentTable } = await import("./AscentTable");
const { MyAscentsList } = await import("./MyAscentsList");
const { usePreferences } = await import("@/stores/preferences");

const ascent = (id: string, name: string): AscentSummaryResponse => ({
  id,
  peakId: `peak-${id}`,
  peakName: name,
  peakAltitudeMeters: 3404,
  ascentDate: "2026-07-20",
  visibility: id === "a" ? "Public" : "Private",
  thumbnailUrl: null,
});

const paged = (
  items: AscentSummaryResponse[],
  totalPages = 1,
): PagedResponse<AscentSummaryResponse> => ({
  items,
  page: 1,
  size: 20,
  totalCount: items.length,
  totalPages,
});

beforeEach(() => {
  usePreferences.setState({ ascentListView: "cards" });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AscentTable", () => {
  it("ascentTable_render_isARealTableWithAHiddenCaption", () => {
    render(<AscentTable ascents={[ascent("a", "Aneto")]} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByText("Your ascents, most recent first"),
    ).toBeInTheDocument();
  });

  it("ascentTable_dateColumn_declaresItsFixedDescendingOrder", () => {
    render(<AscentTable ascents={[ascent("a", "Aneto")]} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("columnheader", { name: "Date" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("ascentTable_headers_areScopedToTheirColumn", () => {
    render(<AscentTable ascents={[ascent("a", "Aneto")]} />, {
      wrapper: IntlWrapper,
    });

    for (const header of screen.getAllByRole("columnheader")) {
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("ascentTable_rows_linkToTheDetailAndToEditing", () => {
    render(<AscentTable ascents={[ascent("a", "Aneto")]} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("link", { name: "Aneto" })).toHaveAttribute(
      "href",
      "/dashboard/ascents/a",
    );
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/dashboard/ascents/a/edit",
    );
  });
});

describe("MyAscentsList", () => {
  it("myAscentsList_showsPublicAndPrivateWithTheirBadge", () => {
    render(
      <MyAscentsList ascents={paged([ascent("a", "Aneto"), ascent("b", "Teide")])} />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getAllByText("Public").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Private").length).toBeGreaterThan(0);
  });

  it("myAscentsList_noSortingOrFilterControlsAreOffered", () => {
    render(<MyAscentsList ascents={paged([ascent("a", "Aneto")])} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("myAscentsList_viewToggle_reportsTheActiveOption", () => {
    render(<MyAscentsList ascents={paged([ascent("a", "Aneto")])} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("button", { name: "Cards" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Table" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("myAscentsList_viewToggle_persistsTheChoice", async () => {
    render(<MyAscentsList ascents={paged([ascent("a", "Aneto")])} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Table" }));

    expect(usePreferences.getState().ascentListView).toBe("table");
  });

  it("myAscentsList_singlePage_hidesThePagination", () => {
    render(<MyAscentsList ascents={paged([ascent("a", "Aneto")])} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("myAscentsList_pageChange_rewritesTheUrl", async () => {
    render(
      <MyAscentsList ascents={paged([ascent("a", "Aneto")], 3)} />,
      { wrapper: IntlWrapper },
    );

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(push).toHaveBeenCalledWith("/dashboard/ascents?page=2");
  });
});
