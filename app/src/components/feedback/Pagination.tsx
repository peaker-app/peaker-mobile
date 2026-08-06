"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const t = useTranslations("common.pagination");

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t("label")}
      className={cn("flex items-center justify-center gap-4", className)}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label={t("previous")}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon aria-hidden className="rtl:-scale-x-100" />
      </Button>
      <p aria-current="page" className="text-sm leading-relaxed">
        {t("summary", { page, totalPages })}
      </p>
      <Button
        variant="outline"
        size="icon"
        aria-label={t("next")}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRightIcon aria-hidden className="rtl:-scale-x-100" />
      </Button>
    </nav>
  );
};
