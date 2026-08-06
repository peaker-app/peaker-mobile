import { useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import {
  pageSize,
  parsePeakQuery,
} from "@/app/[locale]/(public)/peaks/searchParams";
import { PeakFiltersSheet } from "@/components/features/peaks/PeakFiltersSheet";
import { PeakSearchInput } from "@/components/features/peaks/PeakSearchInput";
import { Button } from "@/components/ui/Button";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { Link } from "@/i18n/navigation";
import { endpoints } from "@/lib/api/endpoints";
import type { PeakListItemResponse } from "@/types/api";
import { PeakResults } from "./PeakResults";

export const PeaksScreen = () => {
  const t = useTranslations("peaks");
  const nav = useTranslations("nav");
  const [params] = useSearchParams();
  const query = parsePeakQuery(Object.fromEntries(params));

  const results = usePagedQuery<PeakListItemResponse>(
    ["peaks", "catalogue"],
    query.q ? endpoints.peaks.search : endpoints.peaks.list,
    {
      page: query.page,
      size: pageSize,
      filters: {
        q: query.q,
        country: query.country,
        region: query.region,
        minAltitude: query.minAltitude,
        maxAltitude: query.maxAltitude,
      },
    },
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl leading-relaxed font-semibold text-start">
        {t("title")}
      </h1>
      <PeakSearchInput key={query.q} defaultValue={query.q} showHelp />
      <div className="flex flex-wrap items-center gap-2">
        <PeakFiltersSheet query={query} />
        <Button asChild variant="ghost">
          <Link href="/peaks/nearby">{nav("nearby")}</Link>
        </Button>
      </div>
      <PeakResults query={query} results={results} />
    </main>
  );
};
