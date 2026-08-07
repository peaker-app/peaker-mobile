"use client";

import { useTranslations } from "next-intl";
import type { SubmitProgressState } from "@/lib/ascents/submitAscent";

export interface SubmitProgressProps {
  state: SubmitProgressState;
  maxPhotos: number;
}

const completedSteps = (state: SubmitProgressState): number =>
  state.phase === "ascent" ? 0 : state.phase === "done" ? state.total + 1 : state.current;

export const SubmitProgress = ({ state }: SubmitProgressProps) => {
  const t = useTranslations("ascentForm.progress");

  const totalSteps = state.total + 1;
  const value = completedSteps(state);
  const label =
    state.phase === "ascent"
      ? t("savingAscent")
      : state.phase === "done"
        ? t("done")
        : t("uploadingPhoto", { current: state.current, total: state.total });

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-label={t("label")}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-valuenow={value}
        aria-valuetext={label}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <span
          className="block h-full bg-primary transition-[width]"
          style={{ width: `${(value / totalSteps) * 100}%` }}
        />
      </div>
      <p aria-live="polite" className="text-sm leading-relaxed text-start">
        {label}
      </p>
    </div>
  );
};
