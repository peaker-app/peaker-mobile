import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorScreen } from "./ErrorScreen";
import { NotFoundScreen } from "./NotFoundScreen";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SC-21 · not-found", () => {
  it("notFound_render_statesTheCodeAndTheReason", () => {
    renderWithProviders(<NotFoundScreen />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "This page doesn't exist" }),
    ).toBeInTheDocument();
  });

  it("notFound_render_offersTwoWaysOut", () => {
    renderWithProviders(<NotFoundScreen />);

    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Search peaks" })).toHaveAttribute(
      "href",
      "/peaks",
    );
  });
});

describe("SC-21 · error", () => {
  it("error_render_movesFocusToTheHeading", () => {
    renderWithProviders(<ErrorScreen reset={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toHaveFocus();
  });

  it("error_retryClicked_callsReset", async () => {
    const reset = vi.fn();
    renderWithProviders(<ErrorScreen reset={reset} />);

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledOnce();
  });

  it("error_withAReference_showsItBehindADisclosure", () => {
    renderWithProviders(<ErrorScreen reference="corr-42" reset={vi.fn()} />);

    expect(screen.getByText("Technical reference")).toBeInTheDocument();
    expect(screen.getByText("corr-42")).toBeInTheDocument();
  });

  it("error_withoutAReference_hidesTheDisclosure", () => {
    renderWithProviders(<ErrorScreen reset={vi.fn()} />);

    expect(screen.queryByText("Technical reference")).not.toBeInTheDocument();
  });

  it("error_render_offersAWayHome", () => {
    renderWithProviders(<ErrorScreen reset={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

describe("ErrorBoundary", () => {
  const Bomb = ({ fail }: { fail: boolean }) => {
    if (fail) {
      throw new Error("render exploded");
    }

    return <p>safe</p>;
  };

  it("errorBoundary_childThrows_showsTheErrorScreen", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderWithProviders(
      <ErrorBoundary>
        <Bomb fail />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(screen.getByText("render exploded")).toBeInTheDocument();
  });

  it("errorBoundary_childRenders_leavesItAlone", () => {
    renderWithProviders(
      <ErrorBoundary>
        <Bomb fail={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("safe")).toBeInTheDocument();
  });

  it("errorBoundary_retryOnceTheCauseIsGone_recovers", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let failing = true;
    const Flaky = () => {
      if (failing) {
        throw new Error("transient");
      }

      return <p>recovered</p>;
    };

    renderWithProviders(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );
    expect(screen.getByText("transient")).toBeInTheDocument();
    failing = false;

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("recovered")).toBeInTheDocument();
  });
});
