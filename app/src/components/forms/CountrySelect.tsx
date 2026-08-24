"use client";

import { useLocale } from "next-intl";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { Locale } from "@/i18n/config";
import { countryOptions } from "@/lib/countries";

export const anyCountryValue = "__any__";

export interface CountrySelectProps {
  id: string;
  value: string;
  placeholder: string;
  onChange: (code: string) => void;
  describedBy?: string;
}

export const CountrySelect = ({
  id,
  value,
  placeholder,
  onChange,
  describedBy,
}: CountrySelectProps) => {
  const locale = useLocale() as Locale;
  const countries = useMemo(() => countryOptions(locale), [locale]);

  return (
    <Select
      value={value || anyCountryValue}
      onValueChange={(next) => onChange(next === anyCountryValue ? "" : next)}
    >
      <SelectTrigger id={id} aria-describedby={describedBy}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        <SelectItem value={anyCountryValue}>{placeholder}</SelectItem>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
