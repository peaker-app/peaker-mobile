import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { RegisterAscentRequest } from "@/types/api";

const replace = vi.fn();

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

vi.mock("@/i18n/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("@/i18n/navigation")>(
      "@/i18n/navigation",
    );

  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace,
      back: vi.fn(),
      refresh: vi.fn(),
    }),
  };
});

const { QueuedAscentDetail } = await import("./QueuedAscentDetail");
const { QueuedAscentsList } = await import("./QueuedAscentsList");
const { enqueueAscent, queuedAscents, useOfflineQueue } = await import(
  "@/lib/offline/queue"
);

const request: RegisterAscentRequest = {
  peakId: "0198f000-0000-7000-8000-0000000000a1",
  ascentDate: "2026-07-01",
  companions: null,
  routeNotes: null,
  snow: null,
  wind: null,
  trail: null,
  visibility: "Public",
};

const entry = (overrides: Record<string, unknown> = {}) => ({
  clientAscentId: "key-1",
  request,
  peak: { name: "Aneto", altitudeMeters: 3404 },
  queuedAtUtc: "2026-08-08T10:00:00.000Z",
  photos: [],
  droppedPhotos: 0,
  status: "pending" as const,
  attempts: 0,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  useOfflineQueue.setState({ entries: [] });
});

describe("QueuedAscentsList", () => {
  it("queuedList_emptyQueue_rendersNothing", () => {
    const { container } = renderWithProviders(<QueuedAscentsList />);

    expect(container).toBeEmptyDOMElement();
  });

  it("queuedList_pendingEntry_linksToItsOfflineDetail", () => {
    enqueueAscent(entry());

    renderWithProviders(<QueuedAscentsList />);

    expect(screen.getByRole("link", { name: /Aneto/ })).toHaveAttribute(
      "href",
      "/dashboard/ascents/key-1",
    );
  });

  it("queuedList_pendingEntry_showsItIsWaitingToBeSent", () => {
    enqueueAscent(entry());

    renderWithProviders(<QueuedAscentsList />);

    expect(screen.getByText("Waiting to be sent")).toBeInTheDocument();
  });

  it("queuedList_rejectedEntry_saysItWasNotSent", () => {
    enqueueAscent(entry({ status: "rejected" }));

    renderWithProviders(<QueuedAscentsList />);

    expect(screen.getByText("Not sent")).toBeInTheDocument();
  });
});

describe("QueuedAscentDetail", () => {
  it("queuedDetail_pendingEntry_explainsItIsWaitingForAConnection", () => {
    renderWithProviders(<QueuedAscentDetail entry={entry()} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Waiting for a connection",
    );
  });

  it("queuedDetail_rejectedEntry_saysItWillNotBeRetried", () => {
    renderWithProviders(
      <QueuedAscentDetail entry={entry({ status: "rejected" })} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "This ascent couldn't be sent",
    );
  });

  it("queuedDetail_droppedPhotos_warnsAboutThem", () => {
    renderWithProviders(<QueuedAscentDetail entry={entry({ droppedPhotos: 2 })} />);

    expect(
      screen.getByText(/2 photos couldn't be saved on your device/, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("queuedDetail_noDroppedPhotos_saysNothingAboutThem", () => {
    renderWithProviders(<QueuedAscentDetail entry={entry()} />);

    expect(
      screen.queryByText(/couldn't be saved on your device/),
    ).not.toBeInTheDocument();
  });

  it("queuedDetail_storedPhotos_showsThemWaitingToBeUploaded", async () => {
    renderWithProviders(
      <QueuedAscentDetail
        entry={entry({
          photos: [
            { path: "peaker-offline-key-1-0", name: "a.jpg", type: "image/jpeg" },
            { path: "peaker-offline-key-1-1", name: "b.jpg", type: "image/jpeg" },
          ],
        })}
      />,
    );

    expect(
      await screen.findByText("2 photos waiting to be uploaded"),
    ).toBeInTheDocument();
    expect(await screen.findAllByRole("presentation")).toHaveLength(2);
  });

  it("queuedList_storedPhotos_countsThemInTheRow", () => {
    enqueueAscent(
      entry({
        photos: [
          { path: "peaker-offline-key-1-0", name: "a.jpg", type: "image/jpeg" },
        ],
      }),
    );

    renderWithProviders(<QueuedAscentsList />);

    expect(screen.getByText(/1 photo/)).toBeInTheDocument();
  });

  it("queuedDetail_discard_removesItFromTheQueueAndLeaves", async () => {
    enqueueAscent(entry());
    renderWithProviders(<QueuedAscentDetail entry={entry()} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Discard this ascent" }),
    );

    expect(queuedAscents()).toHaveLength(0);
    expect(replace).toHaveBeenCalledWith("/dashboard/ascents");
  });

  it("queuedDetail_always_linksBackToThePeak", () => {
    renderWithProviders(<QueuedAscentDetail entry={entry()} />);

    expect(screen.getByRole("link", { name: "Aneto" })).toHaveAttribute(
      "href",
      `/peaks/${request.peakId}`,
    );
  });
});
