import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { Pagination } from "./Pagination";

const noop = () => undefined;

describe("Pagination", () => {
  it("pagination_singlePage_rendersNothing", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={noop} />,
      { wrapper: IntlWrapper },
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("pagination_firstPage_disablesPreviousButton", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={noop} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("pagination_lastPage_disablesNextButton", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={noop} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("pagination_nextClicked_reportsFollowingPage", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
