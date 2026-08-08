import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "use-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

const resolveInitialLocale = vi.fn();
const storeLocale = vi.fn();

vi.mock("./locale", () => ({
  localePreferenceKey: "locale",
  resolveInitialLocale: () => resolveInitialLocale(),
  storeLocale: (locale: string) => storeLocale(locale),
  readStoredLocale: vi.fn(),
  detectDeviceLocale: vi.fn(),
}));

const { LocaleProvider, useLocaleSetting } = await import("./LocaleProvider");

const Probe = () => {
  const { locale, setLocale } = useLocaleSetting();
  const t = useTranslations("errors.generic");

  return (
    <div>
      <p data-testid="locale">{locale}</p>
      <p data-testid="retry">{t("retry")}</p>
      <button type="button" onClick={() => setLocale("ar")}>
        arabic
      </button>
    </div>
  );
};

const renderProvider = () =>
  render(
    <LocaleProvider>
      <Probe />
    </LocaleProvider>,
  );

afterEach(() => {
  vi.clearAllMocks();
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
});

describe("LocaleProvider", () => {
  it("localeProvider_resolvedLocale_translatesWithIt", async () => {
    resolveInitialLocale.mockResolvedValue("es");

    renderProvider();

    expect(await screen.findByTestId("locale")).toHaveTextContent("es");
    expect(screen.getByTestId("retry")).toHaveTextContent("Reintentar");
  });

  it("localeProvider_ltrLocale_marksTheDocumentLeftToRight", async () => {
    resolveInitialLocale.mockResolvedValue("en");

    renderProvider();
    await screen.findByTestId("locale");

    expect(document.documentElement).toHaveAttribute("dir", "ltr");
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });

  it("localeProvider_arabic_marksTheDocumentRightToLeft", async () => {
    resolveInitialLocale.mockResolvedValue("ar");

    renderProvider();
    await screen.findByTestId("locale");

    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
  });

  it("setLocale_newChoice_switchesDirectionAndPersists", async () => {
    resolveInitialLocale.mockResolvedValue("en");
    renderProvider();
    await screen.findByTestId("locale");

    await userEvent.click(screen.getByRole("button", { name: "arabic" }));

    await vi.waitFor(() => {
      expect(document.documentElement).toHaveAttribute("dir", "rtl");
    });
    expect(storeLocale).toHaveBeenCalledWith("ar");
  });

  it("localeProvider_beforeResolving_rendersNothing", () => {
    resolveInitialLocale.mockReturnValue(new Promise(() => undefined));

    renderProvider();

    expect(screen.queryByTestId("locale")).not.toBeInTheDocument();
  });

  it("useLocaleSetting_outsideTheProvider_failsLoudly", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrowError(
      "useLocaleSetting must be used inside a LocaleProvider",
    );
  });
});
