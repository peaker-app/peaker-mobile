"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { AscentPhotoResponse } from "@/types/api";

export interface PhotoGalleryProps {
  photos: readonly AscentPhotoResponse[];
  peakName: string;
}

const thumbnailWidth = 320;
const thumbnailHeight = 240;

export const PhotoGallery = ({ photos, peakName }: PhotoGalleryProps) => {
  const t = useTranslations("ascents.gallery");
  const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);

  const total = photos.length;
  const active = openIndex === undefined ? undefined : photos[openIndex];

  const step = (delta: number) =>
    setOpenIndex((current) =>
      current === undefined ? current : (current + delta + total) % total,
    );

  useEffect(() => {
    if (openIndex === undefined) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        step(1);
      }

      if (event.key === "ArrowLeft") {
        step(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (total === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={t("open", { index: index + 1 })}
              className="block w-full overflow-hidden rounded-md border border-border"
            >
              <Image
                src={photo.secureUrl}
                alt={t("photoAlt", { index: index + 1, peak: peakName })}
                width={thumbnailWidth}
                height={thumbnailHeight}
                className="h-40 w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={active !== undefined}
        onOpenChange={(open) => setOpenIndex(open ? openIndex : undefined)}
      >
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">
            {t("photoAlt", { index: (openIndex ?? 0) + 1, peak: peakName })}
          </DialogTitle>
          {active ? (
            <Image
              src={active.secureUrl}
              alt={t("photoAlt", {
                index: (openIndex ?? 0) + 1,
                peak: peakName,
              })}
              width={active.width}
              height={active.height}
              className="h-auto w-full rounded-md object-contain"
            />
          ) : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label={t("previous")}
              onClick={() => step(-1)}
              disabled={total < 2}
            >
              <ChevronLeftIcon aria-hidden className="rtl:-scale-x-100" />
            </Button>
            <p className="text-sm leading-relaxed">
              {t("counter", { index: (openIndex ?? 0) + 1, total })}
            </p>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("next")}
              onClick={() => step(1)}
              disabled={total < 2}
            >
              <ChevronRightIcon aria-hidden className="rtl:-scale-x-100" />
            </Button>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="mt-3 w-full">
              {t("close")}
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </section>
  );
};
