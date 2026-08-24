import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";
import { useTranslations } from "use-intl";
import {
  activeFilterCount,
  type PeakQuery,
} from "@/app/[locale]/(public)/peaks/searchParams";
import { PeakFilters } from "@/components/features/peaks/PeakFilters";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";

export const PeakFiltersSheet = ({ query }: { query: PeakQuery }) => {
  const t = useTranslations("peaks.filters");
  const { search } = useLocation();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const count = activeFilterCount(query);

  const open = openedAt === search;
  const changeOpen = (next: boolean) => setOpenedAt(next ? search : null);

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontalIcon aria-hidden />
          {count > 0 ? t("open", { count }) : t("heading")}
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle className="text-lg leading-relaxed font-semibold text-start">
          {t("heading")}
        </SheetTitle>
        <PeakFilters key={search} query={query} />
        <SheetClose asChild>
          <Button variant="ghost">{t("close")}</Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};
