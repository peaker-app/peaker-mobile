export const gatewayUrl = (): string => {
  const url = import.meta.env.VITE_GATEWAY_URL;

  if (!url) {
    throw new Error("VITE_GATEWAY_URL is not configured.");
  }

  return url.replace(/\/$/, "");
};
