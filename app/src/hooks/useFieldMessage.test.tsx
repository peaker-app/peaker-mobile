import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { useFieldMessage } from "./useFieldMessage";

const render = (locale?: "es") =>
  renderHook(() => useFieldMessage(), {
    wrapper: ({ children }) => (
      <IntlWrapper locale={locale}>{children}</IntlWrapper>
    ),
  });

describe("useFieldMessage", () => {
  it("useFieldMessage_knownCode_returnsTheTranslation", () => {
    const { result } = render();

    expect(result.current("User.EmailInvalid")).toBe(
      "That email address isn't valid.",
    );
  });

  it("useFieldMessage_codeWithPlaceholder_fillsInTheMinimumLength", () => {
    const { result } = render();

    expect(result.current("field.passwordTooShort")).toBe(
      "The password must be at least 10 characters long.",
    );
  });

  it("useFieldMessage_spanishLocale_returnsTheSpanishTranslation", () => {
    const { result } = render("es");

    expect(result.current("User.TermsNotAccepted")).toBe(
      "Debes confirmar que tienes al menos 14 años y aceptar las Condiciones de uso y la Política de privacidad.",
    );
  });

  it("useFieldMessage_alreadyTranslatedMessage_isLeftUntouched", () => {
    const { result } = render();
    const fromServer = "That email address is already registered.";

    expect(result.current(fromServer)).toBe(fromServer);
  });

  it("useFieldMessage_noMessage_returnsUndefined", () => {
    const { result } = render();

    expect(result.current(undefined)).toBeUndefined();
  });
});
