"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export interface PeakSearchInputProps {
  defaultValue?: string;
  showHelp?: boolean;
  className?: string;
}

export const PeakSearchInput = ({
  defaultValue = "",
  showHelp = false,
  className,
}: PeakSearchInputProps) => {
  const t = useTranslations("peaks.search");
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const inputId = useId();
  const helpId = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();

    router.push(
      trimmed ? `/peaks?q=${encodeURIComponent(trimmed)}` : "/peaks",
    );
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        {t("label")}
      </label>
      <div className="flex w-full gap-2">
        <Input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("placeholder")}
          aria-describedby={showHelp ? helpId : undefined}
        />
        <Button type="submit" className="gap-2">
          <SearchIcon aria-hidden className="size-4" />
          {t("submit")}
        </Button>
      </div>
      {showHelp ? (
        <p id={helpId} className="text-sm leading-relaxed text-muted-foreground">
          {t("help")}
        </p>
      ) : null}
    </form>
  );
};
