"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import {
  snowValues,
  trailValues,
  windValues,
  type SnowCondition,
  type TrailCondition,
  type WindCondition,
} from "@/types/api";

const unspecified = "__unspecified__";

export interface ConditionsValue {
  snow: SnowCondition | null;
  wind: WindCondition | null;
  trail: TrailCondition | null;
}

export interface ConditionsPickerProps {
  value: ConditionsValue;
  onChange: (value: ConditionsValue) => void;
}

export const ConditionsPicker = ({ value, onChange }: ConditionsPickerProps) => {
  const t = useTranslations("conditions");

  const groups = [
    { key: "snow" as const, options: snowValues },
    { key: "wind" as const, options: windValues },
    { key: "trail" as const, options: trailValues },
  ];

  return (
    <fieldset className="flex flex-col gap-4 md:flex-row">
      <legend className="sr-only">{t("label")}</legend>
      {groups.map(({ key, options }) => (
        <div key={key} className="flex w-full flex-col gap-1.5 md:min-w-44">
          <Label htmlFor={`condition-${key}`}>{t(`${key}.label`)}</Label>
          <Select
            value={value[key] ?? unspecified}
            onValueChange={(next) =>
              onChange({
                ...value,
                [key]: next === unspecified ? null : next,
              })
            }
          >
            <SelectTrigger id={`condition-${key}`}>
              <SelectValue placeholder={t("unspecified")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={unspecified}>{t("unspecified")}</SelectItem>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`${key}.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </fieldset>
  );
};
