import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { RegisterAscentRequest } from "@/types/api";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: () => Promise.resolve({ value: null }),
    set: () => Promise.resolve(),
  },
}));

vi.mock("@capacitor/filesystem", () => ({
  Directory: { Data: "DATA" },
  Filesystem: {
    writeFile: () => Promise.resolve(),
    readFile: () => Promise.resolve({ data: "AAEC" }),
    deleteFile: () => Promise.resolve(),
  },
}));

vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    useParams: () => ({ id: "key-1" }),
    useSearchParams: () => [new URLSearchParams(""), vi.fn()],
  };
});

vi.mock("@/lib/native/camera", () => ({
  picker: {
    takePhoto: vi.fn().mockResolvedValue({ status: "cancelled" }),
    chooseFromGallery: vi.fn().mockResolvedValue({ status: "cancelled" }),
  },
  remainingSlots: (taken: number) => Math.max(3 - taken, 1),
}));

const { AscentDetailScreen } = await import("./AscentDetailScreen");
const { enqueueAscent, useOfflineQueue } = await import("@/lib/offline/queue");

const request: RegisterAscentRequest = {
  peakId: "peak-1",
  ascentDate: "2026-07-01",
  companions: null,
  routeNotes: null,
  snow: null,
  wind: null,
  trail: null,
  visibility: "Public",
};

const fetchMock = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  vi.clearAllMocks();
  useOfflineQueue.setState({ entries: [] });
});

describe("AscentDetailScreen with a queued ascent", () => {
  it("ascentDetailScreen_queuedId_rendersTheOfflineDetail", () => {
    enqueueAscent({
      clientAscentId: "key-1",
      request,
      peak: { name: "Aneto", altitudeMeters: 3404 },
      queuedAtUtc: "2026-08-08T10:00:00.000Z",
      photos: [],
      droppedPhotos: 0,
      status: "pending",
      attempts: 0,
    });

    renderWithProviders(<AscentDetailScreen />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Waiting for a connection",
    );
  });

  it("ascentDetailScreen_queuedId_neverAsksTheServerForIt", () => {
    enqueueAscent({
      clientAscentId: "key-1",
      request,
      peak: { name: "Aneto", altitudeMeters: 3404 },
      queuedAtUtc: "2026-08-08T10:00:00.000Z",
      photos: [],
      droppedPhotos: 0,
      status: "pending",
      attempts: 0,
    });

    renderWithProviders(<AscentDetailScreen />);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
