import { describe, expect, it } from "vitest";
import messages from "../../../messages/en.json";
import {
  hasCode,
  isRetryable,
  problemCodes,
  translateProblem,
  type MessageResolver,
  type ProblemDetails,
} from "./problem";

const lookup = (key: string): unknown =>
  key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        typeof node === "object" && node !== null
          ? (node as Record<string, unknown>)[part]
          : undefined,
      messages.errors,
    );

const resolver = ((key: string) => String(lookup(key))) as MessageResolver;
resolver.has = (key: string) => typeof lookup(key) === "string";

describe("problemCodes", () => {
  it("problemCodes_businessError_returnsTitle", () => {
    const problem: ProblemDetails = {
      status: 409,
      title: "Ascent.PhotoLimitReached",
    };

    expect(problemCodes(problem)).toEqual(["Ascent.PhotoLimitReached"]);
  });

  it("problemCodes_validationError_returnsErrorKeys", () => {
    const problem: ProblemDetails = {
      status: 400,
      title: "One or more validation errors occurred.",
      errors: { "Ascent.DateInFuture": ["texto en español"] },
    };

    expect(problemCodes(problem)).toEqual(["Ascent.DateInFuture"]);
  });

  it("problemCodes_validationTitleWithoutErrors_returnsEmpty", () => {
    const problem: ProblemDetails = {
      status: 400,
      title: "One or more validation errors occurred.",
    };

    expect(problemCodes(problem)).toEqual([]);
  });
});

describe("translateProblem", () => {
  it("translateProblem_knownCode_returnsTranslatedMessage", () => {
    const problem: ProblemDetails = { status: 400, title: "Ascent.DateInFuture" };

    expect(translateProblem(problem, resolver)).toBe(
      "The ascent date can't be in the future.",
    );
  });

  it("translateProblem_unknownCode_fallsBackToStatus", () => {
    const problem: ProblemDetails = { status: 503, title: "Some.Unknown.Code" };

    expect(translateProblem(problem, resolver)).toBe(
      "Service temporarily unavailable.",
    );
  });

  it("translateProblem_unknownStatus_fallsBackToUnknown", () => {
    const problem: ProblemDetails = { status: 418 };

    expect(translateProblem(problem, resolver)).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("translateProblem_neverReadsDetail", () => {
    const problem: ProblemDetails = {
      status: 409,
      title: "User.UsernameAlreadyRegistered",
      detail: "Ese correo ya está registrado.",
    };

    expect(translateProblem(problem, resolver)).not.toContain(problem.detail);
  });
});

describe("isRetryable", () => {
  it.each([500, 502, 503, 504])("isRetryable_%iStatus_returnsTrue", (status) => {
    expect(isRetryable({ status })).toBe(true);
  });

  it.each([400, 401, 403, 404, 409, 429])(
    "isRetryable_%iStatus_returnsFalse",
    (status) => {
      expect(isRetryable({ status })).toBe(false);
    },
  );
});

describe("hasCode", () => {
  it("hasCode_matchingCode_returnsTrue", () => {
    expect(
      hasCode({ status: 403, title: "Ascent.EmailNotConfirmed" }, "Ascent.EmailNotConfirmed"),
    ).toBe(true);
  });

  it("hasCode_differentCode_returnsFalse", () => {
    expect(
      hasCode({ status: 404, title: "Ascent.NotFound" }, "Ascent.NotOwned"),
    ).toBe(false);
  });
});
