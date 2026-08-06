import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormField } from "./FormField";

const renderField = (props: Partial<Parameters<typeof FormField>[0]> = {}) => {
  const children = vi.fn(({ describedBy, invalid }) => (
    <input id="peak" aria-describedby={describedBy} aria-invalid={invalid} />
  ));

  render(
    <FormField id="peak" label="Peak" {...props}>
      {children}
    </FormField>,
  );

  return children;
};

describe("FormField", () => {
  it("formField_render_bindsTheLabelToTheControl", () => {
    renderField();

    expect(screen.getByLabelText("Peak")).toBeInTheDocument();
  });

  it("formField_withoutHelpOrError_describesNothing", () => {
    const children = renderField();

    expect(children).toHaveBeenCalledWith({
      describedBy: undefined,
      invalid: false,
    });
  });

  it("formField_withHelp_pointsTheControlAtIt", () => {
    const children = renderField({ help: "Metres above sea level" });

    expect(children).toHaveBeenCalledWith({
      describedBy: "peak-help",
      invalid: false,
    });
    expect(screen.getByText("Metres above sea level")).toHaveAttribute(
      "id",
      "peak-help",
    );
  });

  it("formField_withError_marksTheControlInvalid", () => {
    const children = renderField({ error: "Required" });

    expect(children).toHaveBeenCalledWith({
      describedBy: "peak-error",
      invalid: true,
    });
    expect(screen.getByText("Required")).toHaveAttribute("id", "peak-error");
  });

  it("formField_withErrorAndHelp_announcesTheErrorFirst", () => {
    const children = renderField({ error: "Required", help: "Optional hint" });

    expect(children).toHaveBeenCalledWith({
      describedBy: "peak-error peak-help",
      invalid: true,
    });
  });
});
