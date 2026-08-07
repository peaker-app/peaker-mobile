import { createPersistedStore } from "./persistedStore";

interface EmailConfirmationState {
  unconfirmed: boolean;
  markUnconfirmed: () => void;
  clear: () => void;
}

export const emailConfirmationKey = "peaker-email-confirmation";

export const useEmailConfirmation =
  createPersistedStore<EmailConfirmationState>(emailConfirmationKey, {
    unconfirmed: false,
    markUnconfirmed: () => useEmailConfirmation.setState({ unconfirmed: true }),
    clear: () => useEmailConfirmation.setState({ unconfirmed: false }),
  });
