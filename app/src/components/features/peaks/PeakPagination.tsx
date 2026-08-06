"use client";

import { Pagination } from "@/components/feedback/Pagination";
import { useRouter } from "@/i18n/navigation";
import {
  toQueryString,
  type PeakQuery,
} from "@/app/[locale]/(public)/peaks/searchParams";

export interface PeakPaginationProps {
  query: PeakQuery;
  totalPages: number;
}

export const PeakPagination = ({ query, totalPages }: PeakPaginationProps) => {
  const router = useRouter();

  return (
    <Pagination
      page={query.page}
      totalPages={totalPages}
      onPageChange={(page) =>
        router.push(`/peaks${toQueryString({ ...query, page }, false)}`)
      }
    />
  );
};
