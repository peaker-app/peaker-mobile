import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { IntlWrapper } from "@/test/IntlWrapper";
import {
  useProblemMessage,
  useProblemToast,
  useTranslateProblem,
} from "./useProblemToast";

const toastError = vi.fn();

vi.mock("sonner", () => ({ toast: { error: (message: string) => toastError(message) } }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("useProblemMessage", () => {
  it("useProblemMessage_apiErrorWithKnownCode_returnsTheTranslation", () => {
    const { result } = renderHook(() => useProblemMessage(), {
      wrapper: IntlWrapper,
    });

    expect(
      result.current(new ApiError({ status: 409, title: "Ascent.PhotoLimitReached" })),
    ).toBe("An ascent can have at most 3 photos.");
  });

  it("useProblemMessage_unexpectedError_returnsTheGenericMessage", () => {
    const { result } = renderHook(() => useProblemMessage(), {
      wrapper: IntlWrapper,
    });

    expect(result.current(new Error("boom"))).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("useProblemMessage_neverExposesTheSpanishDetail", () => {
    const { result } = renderHook(() => useProblemMessage(), {
      wrapper: IntlWrapper,
    });
    const detail = "Una ascensión admite como máximo 3 fotos.";

    expect(
      result.current(
        new ApiError({ status: 409, title: "Ascent.PhotoLimitReached", detail }),
      ),
    ).not.toBe(detail);
  });
});

describe("useTranslateProblem", () => {
  it("useTranslateProblem_validationErrors_translatesTheFirstCode", () => {
    const { result } = renderHook(() => useTranslateProblem(), {
      wrapper: IntlWrapper,
    });

    expect(
      result.current({
        status: 400,
        title: "One or more validation errors occurred.",
        errors: { "Ascent.DateInFuture": ["texto"] },
      }),
    ).toBe("The ascent date can't be in the future.");
  });
});

describe("useProblemToast", () => {
  it("useProblemToast_apiError_showsTheTranslatedToast", () => {
    const { result } = renderHook(() => useProblemToast(), {
      wrapper: IntlWrapper,
    });

    result.current(new ApiError({ status: 503 }));

    expect(toastError).toHaveBeenCalledWith("Service temporarily unavailable.");
  });
});
