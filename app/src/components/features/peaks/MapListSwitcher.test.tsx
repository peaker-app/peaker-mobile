import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { MapListSwitcher } from "./MapListSwitcher";

describe("MapListSwitcher", () => {
  it("mapListSwitcher_listPane_marksTheListAsPressed", () => {
    render(<MapListSwitcher pane="list" onChange={() => undefined} />, {
      wrapper: IntlWrapper,
    });

    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Map" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("mapListSwitcher_mapPressed_asksForTheMapPane", async () => {
    const onChange = vi.fn();
    render(<MapListSwitcher pane="list" onChange={onChange} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "Map" }));

    expect(onChange).toHaveBeenCalledWith("map");
  });

  it("mapListSwitcher_listPressedFromTheMap_asksForTheListPane", async () => {
    const onChange = vi.fn();
    render(<MapListSwitcher pane="map" onChange={onChange} />, {
      wrapper: IntlWrapper,
    });

    await userEvent.click(screen.getByRole("button", { name: "List" }));

    expect(onChange).toHaveBeenCalledWith("list");
  });
});
