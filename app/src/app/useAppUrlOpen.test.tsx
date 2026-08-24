import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

type UrlHandler = (event: { url: string }) => void;

const isNativePlatform = vi.fn();
const addListener = vi.fn();
const remove = vi.fn();
const navigate = vi.fn();

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: (event: string, handler: UrlHandler) =>
      addListener(event, handler),
  },
}));

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

const { routeOf, useAppUrlOpen } = await import("./useAppUrlOpen");

const Probe = () => {
  useAppUrlOpen();

  return null;
};

const mountProbe = () =>
  render(
    <MemoryRouter>
      <Probe />
    </MemoryRouter>,
  );

const openedWith = (url: string) => {
  const handler = addListener.mock.calls[0]?.[1] as UrlHandler;
  handler({ url });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("routeOf", () => {
  it("routeOf_appLink_keepsThePathAndDropsTheDomain", () => {
    expect(routeOf("https://peaker.app/confirm-email?token=abc")).toBe(
      "/confirm-email?token=abc",
    );
  });

  it("routeOf_customScheme_treatsTheHostAsTheFirstSegment", () => {
    expect(routeOf("app.peaker.mobile://confirm-email?token=abc")).toBe(
      "/confirm-email?token=abc",
    );
  });

  it("routeOf_customSchemeWithPath_keepsBothSegments", () => {
    expect(routeOf("app.peaker.mobile://confirm-email/pending")).toBe(
      "/confirm-email/pending",
    );
  });

  it("routeOf_encodedToken_isLeftForTheRouterToDecode", () => {
    expect(routeOf("https://peaker.app/confirm-email?token=a%2Bb")).toBe(
      "/confirm-email?token=a%2Bb",
    );
  });

  it("routeOf_bareOrigin_hasNowhereToGo", () => {
    expect(routeOf("https://peaker.app/")).toBeUndefined();
    expect(routeOf("app.peaker.mobile://")).toBeUndefined();
  });

  it("routeOf_garbage_isIgnoredInsteadOfThrowing", () => {
    expect(routeOf("not a url")).toBeUndefined();
  });
});

describe("useAppUrlOpen", () => {
  it("useAppUrlOpen_offDevice_registersNothing", () => {
    isNativePlatform.mockReturnValue(false);

    mountProbe();

    expect(addListener).not.toHaveBeenCalled();
  });

  it("useAppUrlOpen_onDevice_listensForIncomingUrls", () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });

    mountProbe();

    expect(addListener).toHaveBeenCalledWith("appUrlOpen", expect.any(Function));
  });

  it("appUrlOpen_confirmationLink_navigatesToTheRoute", () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });
    mountProbe();

    openedWith("app.peaker.mobile://confirm-email?token=abc");

    expect(navigate).toHaveBeenCalledWith("/confirm-email?token=abc");
  });

  it("appUrlOpen_unroutableUrl_staysPut", () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });
    mountProbe();

    openedWith("app.peaker.mobile://");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("useAppUrlOpen_unmount_removesTheListener", async () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });
    const { unmount } = mountProbe();

    unmount();
    await vi.waitFor(() => {
      expect(remove).toHaveBeenCalledOnce();
    });
  });
});
