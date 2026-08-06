import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  normalizeEmail,
  passwordStrength,
} from "./validation";

describe("normalizeEmail", () => {
  it("normalizeEmail_mixedCaseWithSpaces_isTrimmedAndLowercased", () => {
    expect(normalizeEmail("  Ruben@Correo.ES  ")).toBe("ruben@correo.es");
  });
});

describe("isValidEmail", () => {
  it.each(["ruben@correo.es", "a@b.c", "RUBEN@CORREO.ES", " ruben@correo.es "])(
    "isValidEmail_%s_isAccepted",
    (value) => {
      expect(isValidEmail(value)).toBe(true);
    },
  );

  it.each(["ruben", "ruben@", "@correo.es", "ruben@correo", "ru ben@correo.es", ""])(
    "isValidEmail_%s_isRejected",
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );

  it("isValidEmail_over320Characters_isRejected", () => {
    expect(isValidEmail(`${"a".repeat(320)}@correo.es`)).toBe(false);
  });
});

describe("isValidUsername", () => {
  it.each(["ruben", "ruben.val", "ruben_val", "ruben-val", "a1b", "r2.d2-c3_po"])(
    "isValidUsername_%s_isAccepted",
    (value) => {
      expect(isValidUsername(value)).toBe(true);
    },
  );

  it.each([".ruben", "ruben.", "ruben..val", "ruben__val", "ruben.-val", "-ruben"])(
    "isValidUsername_%s_isRejectedBecauseOfItsSeparators",
    (value) => {
      expect(isValidUsername(value)).toBe(false);
    },
  );

  it.each(["ab", "a".repeat(31)])(
    "isValidUsername_outOfLengthRange_isRejected",
    (value) => {
      expect(isValidUsername(value)).toBe(false);
    },
  );

  it.each(["rubén", "ruben val", "ruben@es", "ruben!"])(
    "isValidUsername_%s_isRejectedBecauseOfItsCharacters",
    (value) => {
      expect(isValidUsername(value)).toBe(false);
    },
  );

  it("isValidUsername_capitals_areAccepted", () => {
    expect(isValidUsername("Ruben")).toBe(true);
  });
});

describe("isValidPassword", () => {
  it("isValidPassword_tenCharacters_isAccepted", () => {
    expect(isValidPassword("a".repeat(10))).toBe(true);
  });

  it("isValidPassword_nineCharacters_isRejected", () => {
    expect(isValidPassword("a".repeat(9))).toBe(false);
  });

  it("isValidPassword_noCompositionIsDemanded", () => {
    expect(isValidPassword("aaaaaaaaaa")).toBe(true);
  });
});

describe("passwordStrength", () => {
  it("passwordStrength_belowTheMinimum_isWeak", () => {
    expect(passwordStrength("short")).toBe("weak");
  });

  it("passwordStrength_longAndVaried_isStrong", () => {
    expect(passwordStrength("Montaña2026!segura")).toBe("strong");
  });

  it("passwordStrength_variedButShort_isFair", () => {
    expect(passwordStrength("Aneto2026!")).toBe("fair");
  });

  it("passwordStrength_longButPlain_isFair", () => {
    expect(passwordStrength("aaaaaaaaaaaaaa")).toBe("fair");
  });

  it("passwordStrength_justTheMinimumAndPlain_isWeak", () => {
    expect(passwordStrength("aaaaaaaaaa")).toBe("weak");
  });
});
