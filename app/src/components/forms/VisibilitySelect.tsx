"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { visibilityValues, type Visibility } from "@/types/api";

export interface VisibilitySelectProps {
  id: string;
  label: string;
  help: string;
  value: Visibility;
  onChange: (value: Visibility) => void;
}

export const VisibilitySelect = ({
  id,
  label,
  help,
  value,
  onChange,
}: VisibilitySelectProps) => {
  const t = useTranslations("visibility");

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next as Visibility)}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {visibilityValues.map((option) => (
            <SelectItem key={option} value={option}>
              {t(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-start">
        {help}
      </p>
    </div>
  );
};
