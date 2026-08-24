"use client";

import { useTranslations } from "next-intl";
import { passwordStrength, type PasswordStrength } from "@/lib/auth/validation";
import { cn } from "@/lib/cn";

const filledSegments: Record<PasswordStrength, number> = {
  weak: 1,
  fair: 2,
  strong: 3,
};

const segmentColour: Record<PasswordStrength, string> = {
  weak: "bg-destructive",
  fair: "bg-warning",
  strong: "bg-primary",
};

export const PasswordStrengthMeter = ({ value }: { value: string }) => {
  const t = useTranslations("auth.passwordStrength");

  if (value === "") {
    return null;
  }

  const strength = passwordStrength(value);
  const filled = filledSegments[strength];

  return (
    <div className="flex flex-col gap-1">
      <div aria-hidden className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full",
              index < filled ? segmentColour[strength] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground text-start">
        {t("label")}
        {": "}
        {t(strength)}
      </p>
    </div>
  );
};
