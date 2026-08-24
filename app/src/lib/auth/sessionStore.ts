import { useSyncExternalStore } from "react";
import { decodeAccessToken } from "./accessToken";

export interface Session {
  userId: string;
  email: string;
}

export type SessionStatus = "unknown" | "authenticated" | "anonymous";

export interface SessionState {
  status: SessionStatus;
  session: Session | undefined;
}

const anonymous: SessionState = { status: "anonymous", session: undefined };

let state: SessionState = { status: "unknown", session: undefined };
const listeners = new Set<() => void>();

const publish = (next: SessionState): void => {
  state = next;

  for (const listener of listeners) {
    listener();
  }
};

export const getSessionState = (): SessionState => state;

export const subscribeSession = (listener: () => void): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const markAnonymous = (): void => publish(anonymous);

export const markAuthenticated = (accessToken: string): void => {
  const claims = decodeAccessToken(accessToken);

  publish(
    claims
      ? {
          status: "authenticated",
          session: { userId: claims.userId, email: claims.email },
        }
      : anonymous,
  );
};

export const useSessionState = (): SessionState =>
  useSyncExternalStore(subscribeSession, getSessionState, getSessionState);
