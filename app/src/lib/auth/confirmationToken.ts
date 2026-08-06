const tokenInUrl = /[?&]token=([^&\s]+)/;

export const extractConfirmationToken = (
  value: string,
): string | undefined => {
  const trimmed = value.trim();
  const [, fromUrl] = tokenInUrl.exec(trimmed) ?? [];
  const token = fromUrl ? decodeURIComponent(fromUrl) : trimmed;

  return token === "" ? undefined : token;
};
