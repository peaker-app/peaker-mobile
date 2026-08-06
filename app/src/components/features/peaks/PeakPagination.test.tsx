import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PeakQuery } from "@/app/[locale]/(public)/peaks/searchParams";
import { IntlWrapper } from "@/test/IntlWrapper";

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }));

const { PeakPagination } = await import("./PeakPagination");

const query: PeakQuery = {
  q: "aneto",
  page: 2,
  country: "ES",
  region: "",
  minAltitude: "",
  maxAltitude: "",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PeakPagination", () => {
  it("peakPagination_singlePage_rendersNothing", () => {
    render(<PeakPagination query={query} totalPages={1} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("peakPagination_nextPage_keepsTheSearchTermAndTheFilters", async () => {
    render(<PeakPagination query={query} totalPages={5} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(push).toHaveBeenCalledWith("/peaks?q=aneto&country=ES&page=3");
  });

  it("peakPagination_backToTheFirstPage_dropsThePageFromTheUrl", async () => {
    render(<PeakPagination query={query} totalPages={5} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Previous page" }));

    expect(push).toHaveBeenCalledWith("/peaks?q=aneto&country=ES");
  });

  it("peakPagination_lastPage_disablesTheNextControl", () => {
    render(<PeakPagination query={{ ...query, page: 5 }} totalPages={5} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
