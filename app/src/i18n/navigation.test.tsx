import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { queryClient } from "@/lib/queryClient";
import { Link, usePathname, useRouter } from "./navigation";

const Probe = () => {
  const router = useRouter();

  return (
    <div>
      <p data-testid="pathname">{usePathname()}</p>
      <Link href="/peaks/42">peak</Link>
      <button type="button" onClick={() => router.push("/peaks")}>
        push
      </button>
      <button type="button" onClick={() => router.replace("/climbers/ana")}>
        replace
      </button>
      <button type="button" onClick={() => router.back()}>
        back
      </button>
      <button type="button" onClick={() => router.refresh()}>
        refresh
      </button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Probe />
    </MemoryRouter>,
  );

const pathname = () => screen.getByTestId("pathname").textContent;

describe("navigation shim", () => {
  it("link_hrefProp_rendersAnAnchorToThatPath", () => {
    renderProbe();

    expect(screen.getByRole("link", { name: "peak" })).toHaveAttribute(
      "href",
      "/peaks/42",
    );
  });

  it("usePathname_currentEntry_returnsThePathname", () => {
    renderProbe();

    expect(pathname()).toBe("/");
  });

  it("push_givenPath_navigatesToIt", async () => {
    renderProbe();

    await userEvent.click(screen.getByRole("button", { name: "push" }));

    expect(pathname()).toBe("/peaks");
  });

  it("replace_givenPath_doesNotLeaveTheOldEntryInHistory", async () => {
    renderProbe();

    await userEvent.click(screen.getByRole("button", { name: "push" }));
    await userEvent.click(screen.getByRole("button", { name: "replace" }));
    expect(pathname()).toBe("/climbers/ana");

    await userEvent.click(screen.getByRole("button", { name: "back" }));

    expect(pathname()).toBe("/");
  });

  it("refresh_called_invalidatesTheQueryCache", async () => {
    const invalidate = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    renderProbe();

    await userEvent.click(screen.getByRole("button", { name: "refresh" }));

    expect(invalidate).toHaveBeenCalledOnce();
    invalidate.mockRestore();
  });
});
