import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { countryName } from "@/lib/countries";
import type { PublicProfileResponse } from "@/types/api";

const avatarSize = 96;

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

export const ProfileHeader = ({
  profile,
}: {
  profile: PublicProfileResponse;
}) => {
  const t = useTranslations("profile.header");
  const locale = useLocale() as Locale;

  return (
    <header className="flex flex-col items-center gap-4 text-center md:flex-row md:text-start">
      {profile.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt={t("avatarAlt", { name: profile.displayName })}
          width={avatarSize}
          height={avatarSize}
          className="size-24 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-24 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold"
        >
          {initials(profile.displayName)}
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-3xl leading-relaxed font-semibold">
          {profile.displayName}
        </h1>
        {profile.countryCode ? (
          <p className="leading-relaxed text-muted-foreground">
            {countryName(locale, profile.countryCode)}
          </p>
        ) : null}
        <p
          dir="auto"
          className="max-w-prose leading-relaxed text-muted-foreground"
        >
          {profile.bio ?? t("noBio")}
        </p>
      </div>
    </header>
  );
};
