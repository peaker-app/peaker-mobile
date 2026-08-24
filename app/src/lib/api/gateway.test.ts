import { afterEach, describe, expect, it, vi } from "vitest";
import { gatewayUrl } from "./gateway";

const setGatewayUrl = (value: string | undefined) => {
  vi.stubEnv("VITE_GATEWAY_URL", value as string);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("gatewayUrl", () => {
  it("returns the configured url", () => {
    setGatewayUrl("http://10.0.2.2:8080");

    expect(gatewayUrl()).toBe("http://10.0.2.2:8080");
  });

  it("drops a single trailing slash so paths do not double it", () => {
    setGatewayUrl("http://localhost:8080/");

    expect(gatewayUrl()).toBe("http://localhost:8080");
  });

  it("throws when the variable is missing", () => {
    setGatewayUrl(undefined);

    expect(() => gatewayUrl()).toThrowError("VITE_GATEWAY_URL is not configured.");
  });
});
