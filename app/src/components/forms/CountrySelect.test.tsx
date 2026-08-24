import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntlWrapper } from "@/test/IntlWrapper";
import { anyCountryValue, CountrySelect } from "./CountrySelect";

const renderSelect = (value = "", onChange = vi.fn()) => {
  render(
    <CountrySelect
      id="country"
      value={value}
      placeholder="Any country"
      onChange={onChange}
    />,
    { wrapper: IntlWrapper },
  );

  return onChange;
};

describe("CountrySelect", () => {
  it("countrySelect_emptyValue_showsThePlaceholder", () => {
    renderSelect();

    expect(screen.getByRole("combobox")).toHaveTextContent("Any country");
  });

  it("countrySelect_knownCode_showsTheLocalisedCountryName", () => {
    renderSelect("ES");

    expect(screen.getByRole("combobox")).toHaveTextContent("Spain");
  });

  it("countrySelect_choosingACountry_reportsItsCode", async () => {
    const onChange = renderSelect();

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Spain" }));

    expect(onChange).toHaveBeenCalledWith("ES");
  });

  it("countrySelect_choosingThePlaceholder_clearsTheFilter", async () => {
    const onChange = renderSelect("ES");

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(
      await screen.findByRole("option", { name: "Any country" }),
    );

    expect(onChange).toHaveBeenCalledWith("");
    expect(anyCountryValue).toBe("__any__");
  });
});
