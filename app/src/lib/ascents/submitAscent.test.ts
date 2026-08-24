import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { PhotoCandidate } from "./photos";

const apiFetch = vi.fn();
const apiUpload = vi.fn();

vi.mock("@/lib/api/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/client")>(
    "@/lib/api/client",
  );

  return {
    ...actual,
    apiFetch: (path: string, init?: RequestInit) => apiFetch(path, init),
    apiUpload: (path: string, body: FormData) => apiUpload(path, body),
  };
});

const { submitAscent } = await import("./submitAscent");

const photo = (name: string): PhotoCandidate => ({
  id: name,
  file: new File(["x"], name, { type: "image/jpeg" }),
  previewUrl: `blob:${name}`,
});

const request = {
  peakId: "peak-1",
  ascentDate: "2026-07-20",
  companions: null,
  routeNotes: null,
  snow: null,
  wind: null,
  trail: null,
  visibility: "Public" as const,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("submitAscent", () => {
  it("submitAscent_withoutPhotos_onlyCreatesTheAscent", async () => {
    apiFetch.mockResolvedValue("ascent-1");

    await expect(submitAscent({ request, photos: [] })).resolves.toEqual({
      ascentId: "ascent-1",
      failedPhotos: 0,
    });
    expect(apiUpload).not.toHaveBeenCalled();
  });

  it("submitAscent_photos_areUploadedAfterTheAscentExists", async () => {
    const order: string[] = [];
    apiFetch.mockImplementation(async () => {
      order.push("ascent");
      return "ascent-1";
    });
    apiUpload.mockImplementation(async () => {
      order.push("photo");
    });

    await submitAscent({ request, photos: [photo("a"), photo("b")] });

    expect(order).toEqual(["ascent", "photo", "photo"]);
  });

  it("submitAscent_photos_areUploadedSequentiallyToPreserveTheirPosition", async () => {
    apiFetch.mockResolvedValue("ascent-1");
    let inFlight = 0;
    let maxInFlight = 0;
    apiUpload.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight -= 1;
    });

    await submitAscent({
      request,
      photos: [photo("a"), photo("b"), photo("c")],
    });

    expect(maxInFlight).toBe(1);
  });

  it("submitAscent_multipart_usesTheLiteralFileFieldName", async () => {
    apiFetch.mockResolvedValue("ascent-1");
    apiUpload.mockResolvedValue(undefined);

    await submitAscent({ request, photos: [photo("a")] });

    const [path, body] = apiUpload.mock.calls[0] as [string, FormData];
    expect(path).toBe("ascents/ascent-1/photos");
    expect(body.get("file")).toBeInstanceOf(File);
  });

  it("submitAscent_photoFailure_keepsTheAscentAndCountsTheFailure", async () => {
    apiFetch.mockResolvedValue("ascent-1");
    apiUpload
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new ApiError({ status: 500 }))
      .mockResolvedValueOnce(undefined);

    const result = await submitAscent({
      request,
      photos: [photo("a"), photo("b"), photo("c")],
    });

    expect(result).toEqual({ ascentId: "ascent-1", failedPhotos: 1 });
  });

  it("submitAscent_photoFailure_neverDeletesTheAscentAsCompensation", async () => {
    apiFetch.mockResolvedValue("ascent-1");
    apiUpload.mockRejectedValue(new ApiError({ status: 500 }));

    await submitAscent({ request, photos: [photo("a")] });

    const methods = apiFetch.mock.calls.map(
      ([, init]) => (init as RequestInit | undefined)?.method,
    );
    expect(methods).not.toContain("DELETE");
    expect(apiFetch).toHaveBeenCalledOnce();
  });

  it("submitAscent_firstPhaseFailure_uploadsNothing", async () => {
    apiFetch.mockRejectedValue(new ApiError({ status: 403 }));

    await expect(
      submitAscent({ request, photos: [photo("a")] }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(apiUpload).not.toHaveBeenCalled();
  });

  it("submitAscent_progress_reportsEachPhase", async () => {
    apiFetch.mockResolvedValue("ascent-1");
    apiUpload.mockResolvedValue(undefined);
    const states: string[] = [];

    await submitAscent({
      request,
      photos: [photo("a"), photo("b")],
      onProgress: (state) => states.push(`${state.phase}:${state.current}`),
    });

    expect(states).toEqual(["ascent:0", "photos:1", "photos:2", "done:2"]);
  });
});
