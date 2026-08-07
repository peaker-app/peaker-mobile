"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { apiFetch, buildQuery } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { placeLabel } from "@/components/features/peaks/PeakCard";
import { formatAltitude } from "@/lib/format";
import { peakDisplayName } from "@/lib/peakName";
import type { PagedResponse, PeakListItemResponse } from "@/types/api";

const debounceMs = 350;
const resultSize = 10;

export interface SelectedPeak {
  id: string;
  name: string;
  altitudeMeters: number;
}

export interface PeakSearchComboboxProps {
  selected?: SelectedPeak;
  onSelect: (peak: SelectedPeak) => void;
  onClear?: () => void;
  disabledIds?: readonly string[];
  disabledHint?: string;
  inputId?: string;
  invalid?: boolean;
  describedBy?: string;
}

export const PeakSearchCombobox = ({
  selected,
  onSelect,
  onClear,
  disabledIds,
  disabledHint,
  inputId: providedInputId,
  invalid,
  describedBy,
}: PeakSearchComboboxProps) => {
  const t = useTranslations("ascentForm.peak");
  const peaks = useTranslations("peaks");
  const units = useTranslations("units");
  const locale = useLocale() as Locale;
  const displayName = (name: string) =>
    peakDisplayName(name, (id) => peaks("unnamed", { id }));
  const listId = useId();
  const generatedInputId = useId();
  const inputId = providedInputId ?? generatedInputId;
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query.trim(), debounceMs);

  const search = useQuery({
    queryKey: ["peaks", "combobox", debounced],
    queryFn: () =>
      apiFetch<PagedResponse<PeakListItemResponse>>(
        `${endpoints.peaks.search}${buildQuery({ q: debounced, size: resultSize })}`,
      ),
    enabled: debounced.length > 0 && selected === undefined,
    retry: false,
  });

  const options = search.data?.items ?? [];
  const isDisabled = (peakId: string) => disabledIds?.includes(peakId) ?? false;

  const choose = (peak: PeakListItemResponse) => {
    if (isDisabled(peak.id)) {
      return;
    }

    onSelect({
      id: peak.id,
      name: displayName(peak.name),
      altitudeMeters: peak.altitudeMeters,
    });
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + delta + options.length) % options.length);
      setOpen(true);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[active];

      if (option) {
        choose(option);
      }
    }
  };

  if (selected) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <output className="font-medium">
          {t("selected", { name: selected.name })}
        </output>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onClear?.();
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          {t("change")}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-2">
      <Input
        id={inputId}
        ref={inputRef}
        role="combobox"
        type="text"
        autoComplete="off"
        aria-expanded={open && options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options[active] ? `${listId}-${active}` : undefined
        }
        aria-invalid={invalid}
        aria-describedby={describedBy}
        placeholder={t("placeholder")}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      <p aria-live="polite" className="text-sm leading-relaxed text-muted-foreground">
        {debounced.length > 0 && !search.isPending
          ? t("results", { count: options.length })
          : ""}
      </p>

      {open && debounced.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-12 z-20 max-h-72 overflow-y-auto rounded-md border border-border bg-card shadow-lg"
        >
          {options.map((peak, index) => (
            <li
              key={peak.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              aria-disabled={isDisabled(peak.id) || undefined}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(peak);
              }}
              className={`p-3 text-start ${
                isDisabled(peak.id) ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              } ${index === active ? "bg-accent text-accent-foreground" : ""}`}
            >
              <span className="block wrap-break-word font-medium" dir="auto">
                {displayName(peak.name)}
              </span>
              <span className="block text-sm text-muted-foreground">
                {units("meters", {
                  value: formatAltitude(locale, peak.altitudeMeters),
                })}
                {placeLabel(locale, peak.countryCode, peak.region)
                  ? ` · ${placeLabel(locale, peak.countryCode, peak.region)}`
                  : ""}
              </span>
              {isDisabled(peak.id) && disabledHint ? (
                <span className="block text-sm font-medium">{disabledHint}</span>
              ) : null}
            </li>
          ))}

          {options.length === 0 && !search.isPending ? (
            <li className="flex flex-col gap-2 p-3 text-start">
              <span>{t("empty", { query: debounced })}</span>
              <Link href="/peaks" className="font-medium underline">
                {t("browse")}
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
};
