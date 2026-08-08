"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/navigation";
import { collectionLabel, isDefaultCollection } from "@/lib/collections/label";
import type { CollectionSummaryResponse } from "@/types/api";

export const CollectionCard = ({
  collection,
}: {
  collection: CollectionSummaryResponse;
}) => {
  const t = useTranslations("collections");

  return (
    <li className="flex h-full flex-col gap-2 rounded-md border border-border bg-card p-5">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        <Link
          href={`/dashboard/collections/${collection.id}`}
          dir="auto"
          className="hover:underline"
        >
          {collectionLabel(collection, t("defaultName"))}
        </Link>
        {isDefaultCollection(collection.kind) ? (
          <Badge className="ms-2 align-middle">{t("defaultBadge")}</Badge>
        ) : null}
      </h2>

      {collection.description ? (
        <p
          dir="auto"
          className="line-clamp-2 text-sm leading-relaxed text-muted-foreground text-start"
        >
          {collection.description}
        </p>
      ) : null}

      <p className="mt-auto pt-2 text-sm leading-relaxed text-muted-foreground text-start">
        {t("peakCount", { count: collection.peakCount })}
      </p>
    </li>
  );
};
