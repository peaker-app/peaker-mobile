export const maxAvatarBytes = 5 * 1024 * 1024;
export const maxAvatarMegabytes = 5;
export const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];

export type AvatarRejection = "tooLarge" | "unsupported";

export const rejectAvatar = (file: File): AvatarRejection | undefined => {
  if (!allowedAvatarTypes.includes(file.type)) {
    return "unsupported";
  }

  return file.size > maxAvatarBytes ? "tooLarge" : undefined;
};

export const displayNameMaxLength = 60;
export const bioMaxLength = 500;
export const slugMaxLength = 80;

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const isValidSlug = (value: string): boolean => {
  const trimmed = value.trim();

  return trimmed.length > 0 && trimmed.length <= slugMaxLength && slugPattern.test(trimmed);
};

export const isValidDisplayName = (value: string): boolean => {
  const trimmed = value.trim();

  return trimmed.length > 0 && trimmed.length <= displayNameMaxLength;
};

export const isValidBio = (value: string): boolean => value.length <= bioMaxLength;

export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
