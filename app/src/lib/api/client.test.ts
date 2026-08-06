import { afterEach, describe, expect, it, vi } from "vitest";
import {
  emptyResponse,
  gatewayOrigin,
  headerOf,
  jsonResponse,
  loadAuth,
  requestOf,
  tokens,
} from "@/test/authHarness";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("buildQuery", () => {
  it("buildQuery_noUsableParams_returnsAnEmptyString", async () => {
    const { client } = await loadAuth();

    expect(client.buildQuery({ a: undefined, b: null, c: "" })).toBe("");
  });

  it("buildQuery_zero_isKept", async () => {
    const { client } = await loadAuth();

    expect(client.buildQuery({ page: 0 })).toBe("?page=0");
  });

  it("buildQuery_severalParams_areJoined", async () => {
    const { client } = await loadAuth();

    expect(client.buildQuery({ page: 1, size: 20 })).toBe("?page=1&size=20");
  });
});

describe("apiFetch", () => {
  it("apiFetch_relativePath_callsTheGatewayUnderApi", async () => {
    const { client } = await loadAuth();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ ok: true }));

    await client.apiFetch("peaks?page=1");

    expect(requestOf(fetchSpy.mock.calls[0] as unknown[]).url).toBe(
      `${gatewayOrigin}/api/peaks?page=1`,
    );
  });

  it("apiFetch_anonymous_sendsNoAuthorizationHeader", async () => {
    const { client } = await loadAuth();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({}));

    await client.apiFetch("peaks");

    const { init } = requestOf(fetchSpy.mock.calls[0] as unknown[]);
    expect(headerOf(init, "Authorization")).toBeUndefined();
    expect(headerOf(init, "Content-Type")).toBe("application/json");
    expect(headerOf(init, "X-Correlation-Id")).toBeDefined();
  });

  it("apiFetch_authenticated_sendsTheBearerToken", async () => {
    const { client, tokenStore } = await loadAuth();
    const pair = tokens();
    await tokenStore.persistTokens(pair);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({}));

    await client.apiFetch("profiles/me");

    const { init } = requestOf(fetchSpy.mock.calls[0] as unknown[]);
    expect(headerOf(init, "Authorization")).toBe(`Bearer ${pair.accessToken}`);
  });

  it("apiFetch_noContent_resolvesToUndefined", async () => {
    const { client } = await loadAuth();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(emptyResponse(204));

    await expect(client.apiFetch("ascents/1")).resolves.toBeUndefined();
  });

  it("apiFetch_problemResponse_throwsApiErrorWithTheProblem", async () => {
    const { client } = await loadAuth();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ title: "Peak.NotFound" }, 404),
    );

    await expect(client.apiFetch("peaks/none")).rejects.toMatchObject({
      name: "ApiError",
      problem: { status: 404, title: "Peak.NotFound" },
    });
  });

  it("apiFetch_nonJsonError_stillCarriesTheStatus", async () => {
    const { client } = await loadAuth();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html>", { status: 502 }),
    );

    await expect(client.apiFetch("peaks")).rejects.toMatchObject({
      problem: { status: 502 },
    });
  });
});

describe("apiFetch unauthorised handling", () => {
  it("apiFetch_401_refreshesAndReplaysWithTheSameCorrelationId", async () => {
    const { client, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(emptyResponse(401))
      .mockResolvedValueOnce(jsonResponse(tokens({ refreshToken: "new" })))
      .mockResolvedValueOnce(jsonResponse({ id: "p-1" }));

    await expect(client.apiFetch("profiles/me")).resolves.toEqual({ id: "p-1" });

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    const first = requestOf(fetchSpy.mock.calls[0] as unknown[]);
    const replay = requestOf(fetchSpy.mock.calls[2] as unknown[]);
    expect(replay.url).toBe(first.url);
    expect(headerOf(replay.init, "X-Correlation-Id")).toBe(
      headerOf(first.init, "X-Correlation-Id"),
    );
  });

  it("apiFetch_401_replaysWithTheRotatedBearerToken", async () => {
    const { client, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    const rotated = tokens({ accessToken: "header.e30.rotated" });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(emptyResponse(401))
      .mockResolvedValueOnce(jsonResponse(rotated))
      .mockResolvedValueOnce(jsonResponse({}));

    await client.apiFetch("profiles/me");

    const replay = requestOf(fetchSpy.mock.calls[2] as unknown[]);
    expect(headerOf(replay.init, "Authorization")).toBe(
      `Bearer ${rotated.accessToken}`,
    );
  });

  it("apiFetch_401_withoutAUsableRefreshToken_propagatesTheOriginalError", async () => {
    const { client } = await loadAuth();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ title: "User.Unauthorized" }, 401));

    await expect(client.apiFetch("profiles/me")).rejects.toMatchObject({
      problem: { status: 401, title: "User.Unauthorized" },
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("apiFetch_403_doesNotRotate", async () => {
    const { client, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ title: "Ascent.Forbidden" }, 403));

    await expect(client.apiFetch("ascents/1")).rejects.toMatchObject({
      problem: { status: 403 },
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});

describe("apiUpload", () => {
  it("apiUpload_neverSetsContentType", async () => {
    const { client, tokenStore } = await loadAuth();
    await tokenStore.persistTokens(tokens());
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ id: "photo-1" }));

    await client.apiUpload("ascents/1/photos", new FormData());

    const { init } = requestOf(fetchSpy.mock.calls[0] as unknown[]);
    expect(headerOf(init, "Content-Type")).toBeUndefined();
    expect(headerOf(init, "Authorization")).toBeDefined();
    expect(headerOf(init, "X-Correlation-Id")).toBeDefined();
  });

  it("apiUpload_byDefault_posts", async () => {
    const { client } = await loadAuth();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(emptyResponse(204));

    await client.apiUpload("profiles/me/avatar", new FormData());

    expect(requestOf(fetchSpy.mock.calls[0] as unknown[]).init.method).toBe("POST");
  });

  it("apiUpload_explicitMethod_isRespected", async () => {
    const { client } = await loadAuth();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(emptyResponse(204));

    await client.apiUpload("profiles/me/avatar", new FormData(), {
      method: "DELETE",
    });

    expect(requestOf(fetchSpy.mock.calls[0] as unknown[]).init.method).toBe(
      "DELETE",
    );
  });
});
