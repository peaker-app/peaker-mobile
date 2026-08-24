"use client";

import { XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import { CountrySelect } from "@/components/forms/CountrySelect";
import type { Locale } from "@/i18n/config";
import { useRouter } from "@/i18n/navigation";
import { countryName } from "@/lib/countries";
import { clamp } from "@/lib/number";
import {
  maxAltitudeBound,
  minAltitudeBound,
  toQueryString,
  type PeakQuery,
} from "@/app/[locale]/(public)/peaks/searchParams";

const altitudeStep = 100;

type AltitudeRange = [number, number];

const asRange = (min: string, max: string): AltitudeRange => [
  Number(min || minAltitudeBound),
  Number(max || maxAltitudeBound),
];

const asText = (range: AltitudeRange): [string, string] => [
  String(range[0]),
  String(range[1]),
];

export const PeakFilters = ({ query }: { query: PeakQuery }) => {
  const t = useTranslations("peaks.filters");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [region, setRegion] = useState(query.region);
  const [altitude, setAltitude] = useState<AltitudeRange>(
    asRange(query.minAltitude, query.maxAltitude),
  );
  const [altitudeText, setAltitudeText] = useState<[string, string]>(
    asText(asRange(query.minAltitude, query.maxAltitude)),
  );

  const changeAltitude = (range: AltitudeRange) => {
    setAltitude(range);
    setAltitudeText(asText(range));
  };

  const syncLocal = (changes: Partial<PeakQuery>) => {
    if (changes.region !== undefined) {
      setRegion(changes.region);
    }

    if (changes.minAltitude !== undefined || changes.maxAltitude !== undefined) {
      changeAltitude(
        asRange(changes.minAltitude ?? "", changes.maxAltitude ?? ""),
      );
    }
  };

  const apply = (changes: Partial<PeakQuery>) => {
    syncLocal(changes);
    router.push(`/peaks${toQueryString({ ...query, ...changes })}`);
  };

  const readAltitude = (index: 0 | 1): number => {
    const parsed = Number.parseInt(altitudeText[index], 10);
    const value = Number.isFinite(parsed) ? parsed : altitude[index];

    return clamp(value, minAltitudeBound, maxAltitudeBound);
  };

  const resolveAltitude = (): AltitudeRange => {
    const min = readAltitude(0);
    const max = readAltitude(1);

    return min <= max ? [min, max] : [max, min];
  };

  const editAltitude = (index: 0 | 1, value: string) =>
    setAltitudeText((current) =>
      index === 0 ? [value, current[1]] : [current[0], value],
    );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [min, max] = resolveAltitude();

    apply({
      region: region.trim(),
      minAltitude: min === minAltitudeBound ? "" : String(min),
      maxAltitude: max === maxAltitudeBound ? "" : String(max),
    });
  };

  const chips = [
    query.country
      ? { key: "country", label: countryName(locale, query.country), reset: { country: "" } }
      : undefined,
    query.region
      ? { key: "region", label: query.region, reset: { region: "" } }
      : undefined,
    query.minAltitude || query.maxAltitude
      ? {
          key: "altitude",
          label: t("altitudeRange", {
            min: query.minAltitude || minAltitudeBound,
            max: query.maxAltitude || maxAltitudeBound,
          }),
          reset: { minAltitude: "", maxAltitude: "" },
        }
      : undefined,
  ].filter((chip) => chip !== undefined);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="country-filter">{t("country")}</Label>
        <CountrySelect
          id="country-filter"
          value={query.country}
          placeholder={t("anyCountry")}
          onChange={(country) => apply({ country })}
        />
      </div>

      <form className="flex flex-col gap-5" onSubmit={submit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="region-filter">{t("region")}</Label>
          <Input
            id="region-filter"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder={t("regionPlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="altitude-filter">{t("altitude")}</Label>
          <Slider
            id="altitude-filter"
            min={minAltitudeBound}
            max={maxAltitudeBound}
            step={altitudeStep}
            value={altitude}
            onValueChange={(value) =>
              changeAltitude([
                value[0] ?? minAltitudeBound,
                value[1] ?? maxAltitudeBound,
              ])
            }
            aria-label={t("altitude")}
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="min-altitude-filter">{t("minAltitude")}</Label>
              <Input
                id="min-altitude-filter"
                type="number"
                inputMode="numeric"
                min={minAltitudeBound}
                max={maxAltitudeBound}
                step={altitudeStep}
                value={altitudeText[0]}
                onChange={(event) => editAltitude(0, event.target.value)}
                onBlur={() => changeAltitude(resolveAltitude())}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="max-altitude-filter">{t("maxAltitude")}</Label>
              <Input
                id="max-altitude-filter"
                type="number"
                inputMode="numeric"
                min={minAltitudeBound}
                max={maxAltitudeBound}
                step={altitudeStep}
                value={altitudeText[1]}
                onChange={(event) => editAltitude(1, event.target.value)}
                onBlur={() => changeAltitude(resolveAltitude())}
              />
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("altitudeRange", { min: altitude[0], max: altitude[1] })}
          </p>
        </div>

        <Button type="submit" aria-label={t("searchLabel")}>
          {t("search")}
        </Button>
      </form>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Button
              key={chip.key}
              variant="outline"
              size="sm"
              className="gap-1"
              aria-label={t("remove", { name: chip.label })}
              onClick={() => apply(chip.reset)}
            >
              {chip.label}
              <XIcon aria-hidden className="size-3.5" />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              apply({
                country: "",
                region: "",
                minAltitude: "",
                maxAltitude: "",
              })
            }
          >
            {t("clearAll")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
