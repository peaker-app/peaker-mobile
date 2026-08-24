import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("useDebouncedValue_initialRender_returnsTheValueImmediately", () => {
    const { result } = renderHook(() => useDebouncedValue("aneto", 350));

    expect(result.current).toBe("aneto");
  });

  it("useDebouncedValue_beforeTheDelay_keepsThePreviousValue", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: "an" } },
    );

    rerender({ value: "aneto" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("an");
  });

  it("useDebouncedValue_afterTheDelay_returnsTheLatestValue", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: "an" } },
    );

    rerender({ value: "aneto" });
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current).toBe("aneto");
  });

  it("useDebouncedValue_rapidChanges_onlyEmitTheLastOne", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: "a" } },
    );

    for (const value of ["an", "ane", "aneto"]) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current).toBe("aneto");
  });
});
