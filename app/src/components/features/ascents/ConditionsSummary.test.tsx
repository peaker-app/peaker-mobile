import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { ConditionsSummary } from "./ConditionsSummary";

describe("ConditionsSummary", () => {
  it("conditionsSummary_allConditions_translatesEveryClosedCatalogue", () => {
    render(
      <ConditionsSummary
        conditions={{ snow: "Deep", wind: "Storm", trail: "Icy" }}
      />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByText("Deep")).toBeInTheDocument();
    expect(screen.getByText("Storm")).toBeInTheDocument();
    expect(screen.getByText("Icy")).toBeInTheDocument();
  });

  it("conditionsSummary_nullValues_areOmittedInsteadOfShowingNoData", () => {
    render(
      <ConditionsSummary
        conditions={{ snow: "Patchy", wind: null, trail: null }}
      />,
      { wrapper: IntlWrapper },
    );

    expect(screen.getByText("Patchy")).toBeInTheDocument();
    expect(screen.queryByText("Wind")).toBeNull();
    expect(screen.queryByText("Trail")).toBeNull();
  });

  it("conditionsSummary_noConditionsAtAll_rendersNothing", () => {
    const { container } = render(
      <ConditionsSummary conditions={{ snow: null, wind: null, trail: null }} />,
      { wrapper: IntlWrapper },
    );

    expect(container).toBeEmptyDOMElement();
  });
});
