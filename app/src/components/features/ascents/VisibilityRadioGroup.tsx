"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { visibilityValues, type Visibility } from "@/types/api";

export interface VisibilityRadioGroupProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
}

export const VisibilityRadioGroup = ({
  value,
  onChange,
}: VisibilityRadioGroupProps) => {
  const t = useTranslations("visibility");
  const form = useTranslations("ascentForm.visibility");
  const groupId = useId();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm leading-relaxed font-medium text-start">
        {form("label")}
      </legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as Visibility)}
      >
        {visibilityValues.map((option) => (
          <div key={option} className="flex items-start gap-3">
            <RadioGroupItem
              value={option}
              id={`${groupId}-${option}`}
              className="mt-0.5"
            />
            <label htmlFor={`${groupId}-${option}`} className="text-start">
              <span className="block font-medium">{t(option)}</span>
              <span className="block text-sm leading-relaxed text-muted-foreground">
                {t(option === "Public" ? "publicHint" : "privateHint")}
              </span>
            </label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
};
