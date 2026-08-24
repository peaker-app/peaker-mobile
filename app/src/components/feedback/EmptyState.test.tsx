import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("emptyState_emptyList_isNotRenderedAsAnError", () => {
    render(<EmptyState title="No peaks match &quot;xyz&quot;" />);

    expect(screen.getByText('No peaks match "xyz"')).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("emptyState_withDescriptionAndAction_rendersBoth", () => {
    render(
      <EmptyState
        title="Nothing here yet"
        description="Try removing some filters."
        action={<button type="button">Clear filters</button>}
      />,
    );

    expect(screen.getByText("Try removing some filters.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
  });
});
