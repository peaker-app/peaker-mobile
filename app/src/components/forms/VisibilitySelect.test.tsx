import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { VisibilitySelect } from "./VisibilitySelect";

const renderSelect = (onChange = vi.fn()) => {
  render(
    <VisibilitySelect
      id="visibility"
      label="Who can see it"
      help="Private ascents stay hidden"
      value="Public"
      onChange={onChange}
    />,
    { wrapper: IntlWrapper },
  );

  return onChange;
};

describe("VisibilitySelect", () => {
  it("visibilitySelect_render_showsTheLabelAndHelp", () => {
    renderSelect();

    expect(screen.getByText("Who can see it")).toBeInTheDocument();
    expect(screen.getByText("Private ascents stay hidden")).toBeInTheDocument();
  });

  it("visibilitySelect_currentValue_isTranslatedInTheTrigger", () => {
    renderSelect();

    expect(screen.getByRole("combobox")).toHaveTextContent("Public");
  });

  it("visibilitySelect_choosingAnotherOption_reportsTheRawValue", async () => {
    const onChange = renderSelect();

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Private" }));

    expect(onChange).toHaveBeenCalledWith("Private");
  });
});
