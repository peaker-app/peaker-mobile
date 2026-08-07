"use client";

import { LayoutGridIcon, TableIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { AscentCard } from "@/components/features/ascents/AscentCard";
import { AscentTable } from "@/components/features/ascents/AscentTable";
import { Pagination } from "@/components/feedback/Pagination";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/stores/preferences";
import type { AscentSummaryResponse, PagedResponse } from "@/types/api";

export const MyAscentsList = ({
  ascents,
}: {
  ascents: PagedResponse<AscentSummaryResponse>;
}) => {
  const t = useTranslations("ascents.mine.view");
  const router = useRouter();
  const view = usePreferences((state) => state.ascentListView);
  const setView = usePreferences((state) => state.setAscentListView);

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label={t("label")}
        className="hidden justify-end gap-2 md:flex"
      >
        <Button
          variant={view === "cards" ? "primary" : "outline"}
          size="sm"
          aria-pressed={view === "cards"}
          onClick={() => setView("cards")}
          className="gap-2"
        >
          <LayoutGridIcon aria-hidden className="size-4" />
          {t("cards")}
        </Button>
        <Button
          variant={view === "table" ? "primary" : "outline"}
          size="sm"
          aria-pressed={view === "table"}
          onClick={() => setView("table")}
          className="gap-2"
        >
          <TableIcon aria-hidden className="size-4" />
          {t("table")}
        </Button>
      </div>

      <ul
        className={cn(
          "flex flex-col gap-3",
          view === "table" ? "md:hidden" : undefined,
        )}
      >
        {ascents.items.map((ascent) => (
          <AscentCard
            key={ascent.id}
            ascent={ascent}
            href={`/dashboard/ascents/${ascent.id}`}
            showVisibility
          />
        ))}
      </ul>

      {view === "table" ? (
        <div className="hidden md:block">
          <AscentTable ascents={ascents.items} />
        </div>
      ) : null}

      <Pagination
        page={ascents.page}
        totalPages={ascents.totalPages}
        onPageChange={(page) =>
          router.push(page === 1 ? "/dashboard/ascents" : `/dashboard/ascents?page=${page}`)
        }
      />
    </div>
  );
};
