import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let emit: (connected: boolean) => void = () => undefined;
const isConnected = vi.fn(() => Promise.resolve(true));

vi.mock("@/lib/native/network", () => ({
  connectivity: {
    isConnected: () => isConnected(),
    subscribe: (listener: (connected: boolean) => void) => {
      emit = listener;

      return () => undefined;
    },
  },
}));

const sessionStatus = vi.fn(() => "authenticated");
let notifySession: () => void = () => undefined;

vi.mock("@/lib/auth/sessionStore", () => ({
  getSessionState: () => ({ status: sessionStatus(), session: undefined }),
  subscribeSession: (listener: () => void) => {
    notifySession = listener;

    return () => undefined;
  },
}));

const restoreSession = vi.fn(() => Promise.resolve());

vi.mock("@/lib/auth/session", () => ({
  restoreSession: () => restoreSession(),
}));

const syncQueuedAscents = vi.fn(() => Promise.resolve());

vi.mock("./sync", () => ({
  syncQueuedAscents: () => syncQueuedAscents(),
}));

const { startOfflineSync, useIsOnline } = await import("./connectivity");

beforeEach(() => {
  vi.clearAllMocks();
  sessionStatus.mockReturnValue("authenticated");
  isConnected.mockResolvedValue(true);
});

describe("startOfflineSync", () => {
  it("connectivity_start_withNetworkAndSession_drainsTheQueue", async () => {
    await startOfflineSync();

    expect(syncQueuedAscents).toHaveBeenCalled();
  });

  it("connectivity_start_withoutNetwork_doesNotDrain", async () => {
    isConnected.mockResolvedValue(false);

    await startOfflineSync();

    expect(syncQueuedAscents).not.toHaveBeenCalled();
  });

  it("connectivity_start_withoutSession_doesNotDrain", async () => {
    sessionStatus.mockReturnValue("anonymous");

    await startOfflineSync();

    expect(syncQueuedAscents).not.toHaveBeenCalled();
  });

  it("connectivity_regainingNetwork_drainsTheQueue", async () => {
    isConnected.mockResolvedValue(false);
    await startOfflineSync();

    emit(true);
    await Promise.resolve();

    expect(syncQueuedAscents).toHaveBeenCalledTimes(1);
  });

  it("connectivity_regainingNetworkWhileAnonymous_rebuildsTheSessionFirst", async () => {
    isConnected.mockResolvedValue(false);
    sessionStatus.mockReturnValue("anonymous");
    await startOfflineSync();

    emit(true);
    await Promise.resolve();

    expect(restoreSession).toHaveBeenCalledTimes(1);
  });

  it("connectivity_regainingNetworkWithASession_doesNotRotateForNothing", async () => {
    isConnected.mockResolvedValue(false);
    await startOfflineSync();

    emit(true);
    await Promise.resolve();

    expect(restoreSession).not.toHaveBeenCalled();
  });

  it("connectivity_losingNetwork_doesNotDrain", async () => {
    await startOfflineSync();
    syncQueuedAscents.mockClear();

    emit(false);

    expect(syncQueuedAscents).not.toHaveBeenCalled();
  });

  it("connectivity_signingIn_drainsWhatWasQueuedWhileAnonymous", async () => {
    sessionStatus.mockReturnValue("anonymous");
    await startOfflineSync();

    sessionStatus.mockReturnValue("authenticated");
    notifySession();

    expect(syncQueuedAscents).toHaveBeenCalledTimes(1);
  });
});

describe("useIsOnline", () => {
  it("useIsOnline_networkChange_reRendersTheSubscriber", async () => {
    isConnected.mockResolvedValue(true);
    await startOfflineSync();

    const { result } = renderHook(() => useIsOnline());

    expect(result.current).toBe(true);

    act(() => {
      emit(false);
    });

    expect(result.current).toBe(false);
  });
});
