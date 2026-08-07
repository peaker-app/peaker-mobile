import { useTranslations } from "next-intl";
import type { AscentConditionsResponse } from "@/types/api";

type ConditionKind = "snow" | "wind" | "trail";

export const ConditionsSummary = ({
  conditions,
}: {
  conditions: AscentConditionsResponse;
}) => {
  const t = useTranslations("conditions");

  const declared: [ConditionKind, string | null][] = [
    ["snow", conditions.snow],
    ["wind", conditions.wind],
    ["trail", conditions.trail],
  ];

  const entries = declared.filter(
    (entry): entry is [ConditionKind, string] => entry[1] !== null,
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("label")}
      </h2>
      <dl className="flex flex-col gap-1 text-start">
        {entries.map(([kind, value]) => (
          <div key={kind} className="flex flex-wrap gap-2 text-sm leading-relaxed">
            <dt className="min-w-0 text-muted-foreground">
              {t(`${kind}.label`)}
            </dt>
            <dd className="min-w-0 font-medium">{t(`${kind}.${value}`)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
