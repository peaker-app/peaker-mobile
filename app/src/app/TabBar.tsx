import {
  LibraryIcon,
  MountainIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "use-intl";
import { NavLink } from "react-router";
import { cn } from "@/lib/cn";

interface Tab {
  href: string;
  labelKey: string;
  Icon: LucideIcon;
}

const tabs: readonly Tab[] = [
  { href: "/peaks", labelKey: "peaks", Icon: SearchIcon },
  { href: "/dashboard", labelKey: "dashboard", Icon: MountainIcon },
  { href: "/dashboard/collections", labelKey: "collections", Icon: LibraryIcon },
  { href: "/dashboard/settings/profile", labelKey: "profile", Icon: UserIcon },
];

const tabClass = (isActive: boolean): string =>
  cn(
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs",
    isActive ? "text-primary" : "text-muted-foreground",
  );

export const TabBar = () => {
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("label")}
      className="sticky bottom-0 flex items-stretch border-t bg-card pb-[env(safe-area-inset-bottom)]"
    >
      {tabs.slice(0, 2).map(({ href, labelKey, Icon }) => (
        <NavLink key={href} to={href} end className={({ isActive }) => tabClass(isActive)}>
          <Icon aria-hidden className="size-5" />
          {t(labelKey)}
        </NavLink>
      ))}
      <NavLink
        to="/dashboard/ascents/new"
        aria-label={t("myAscents")}
        className="flex min-h-14 w-16 items-center justify-center"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PlusIcon aria-hidden className="size-5" />
        </span>
      </NavLink>
      {tabs.slice(2).map(({ href, labelKey, Icon }) => (
        <NavLink key={href} to={href} className={({ isActive }) => tabClass(isActive)}>
          <Icon aria-hidden className="size-5" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
};
