export const emailMaxLength = 320;
export const usernameMinLength = 3;
export const usernameMaxLength = 30;
export const passwordMinLength = 10;

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const usernamePattern = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;

export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();

export const isValidEmail = (value: string): boolean => {
  const normalized = normalizeEmail(value);

  return normalized.length <= emailMaxLength && emailPattern.test(normalized);
};

export const isValidUsername = (value: string): boolean => {
  const trimmed = value.trim();

  return (
    trimmed.length >= usernameMinLength &&
    trimmed.length <= usernameMaxLength &&
    usernamePattern.test(trimmed)
  );
};

export const isValidPassword = (value: string): boolean =>
  value.length >= passwordMinLength;

export type PasswordStrength = "weak" | "fair" | "strong";

export const passwordStrength = (value: string): PasswordStrength => {
  if (value.length < passwordMinLength) {
    return "weak";
  }

  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((pattern) =>
    pattern.test(value),
  ).length;

  if (value.length >= 16 && variety >= 3) {
    return "strong";
  }

  return variety >= 3 || value.length >= 14 ? "fair" : "weak";
};
