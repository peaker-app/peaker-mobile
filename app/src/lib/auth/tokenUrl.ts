export const forgetTokenInUrl = (): void => {
  if (typeof window === "undefined" || !window.location.search) {
    return;
  }

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.hash}`,
  );
};
