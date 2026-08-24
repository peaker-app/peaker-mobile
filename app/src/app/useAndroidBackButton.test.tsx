import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

type BackHandler = (event: { canGoBack: boolean }) => void;

const isNativePlatform = vi.fn();
const addListener = vi.fn();
const exitApp = vi.fn();
const remove = vi.fn();
const navigate = vi.fn();

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: (event: string, handler: BackHandler) =>
      addListener(event, handler),
    exitApp: () => exitApp(),
  },
}));

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

const { useAndroidBackButton } = await import("./useAndroidBackButton");

const Probe = () => {
  useAndroidBackButton();

  return null;
};

const mountProbe = () =>
  render(
    <MemoryRouter>
      <Probe />
    </MemoryRouter>,
  );

const firedWith = (canGoBack: boolean) => {
  const handler = addListener.mock.calls[0]?.[1] as BackHandler;
  handler({ canGoBack });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("useAndroidBackButton", () => {
  it("useAndroidBackButton_offDevice_registersNothing", () => {
    isNativePlatform.mockReturnValue(false);

    mountProbe();

    expect(addListener).not.toHaveBeenCalled();
  });

  it("useAndroidBackButton_onDevice_listensForTheHardwareButton", () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });

    mountProbe();

    expect(addListener).toHaveBeenCalledWith("backButton", expect.any(Function));
  });

  it("backButton_withHistory_goesBackInsteadOfExiting", () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });
    mountProbe();

    firedWith(true);

    expect(navigate).toHaveBeenCalledWith(-1);
    expect(exitApp).not.toHaveBeenCalled();
  });

  it("backButton_atTheRoot_leavesTheApp", () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });
    mountProbe();

    firedWith(false);

    expect(exitApp).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("useAndroidBackButton_unmount_removesTheListener", async () => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockResolvedValue({ remove });
    const { unmount } = mountProbe();

    unmount();
    await vi.waitFor(() => {
      expect(remove).toHaveBeenCalledOnce();
    });
  });
});
