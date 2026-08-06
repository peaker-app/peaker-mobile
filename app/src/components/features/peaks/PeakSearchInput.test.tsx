import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }));

const { PeakSearchInput } = await import("./PeakSearchInput");

afterEach(() => {
  vi.clearAllMocks();
});

describe("PeakSearchInput", () => {
  it("peakSearchInput_render_isASearchLandmarkWithALabelledField", () => {
    render(<PeakSearchInput />, { wrapper: IntlWrapper });

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByLabelText("Search peaks")).toBeInTheDocument();
  });

  it("peakSearchInput_submit_navigatesToTheCatalogueWithTheTerm", async () => {
    render(<PeakSearchInput />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByRole("searchbox"), "aneto");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(push).toHaveBeenCalledWith("/peaks?q=aneto");
  });

  it("peakSearchInput_termWithSpaces_isTrimmedAndEncoded", async () => {
    render(<PeakSearchInput />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByRole("searchbox"), "  mont blanc  ");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(push).toHaveBeenCalledWith("/peaks?q=mont%20blanc");
  });

  it("peakSearchInput_emptySubmit_goesToTheCleanCatalogue", async () => {
    render(<PeakSearchInput />, { wrapper: IntlWrapper });

    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(push).toHaveBeenCalledWith("/peaks");
  });

  it("peakSearchInput_landingUsage_neverCallsTheApi", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<PeakSearchInput />, { wrapper: IntlWrapper });

    await userEvent.type(screen.getByRole("searchbox"), "aneto");

    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("peakSearchInput_withHelp_describesTheFieldForScreenReaders", () => {
    render(<PeakSearchInput showHelp />, { wrapper: IntlWrapper });

    expect(screen.getByRole("searchbox")).toHaveAccessibleDescription(
      "Search by any name of the mountain, in any language.",
    );
  });

  it("peakSearchInput_defaultValue_prefillsTheField", () => {
    render(<PeakSearchInput defaultValue="teide" />, { wrapper: IntlWrapper });

    expect(screen.getByRole("searchbox")).toHaveValue("teide");
  });
});
