import { MountainSnowIcon } from "lucide-react";
import { useTranslations } from "use-intl";
import { Outlet } from "react-router";
import { Link } from "@/i18n/navigation";
import { useAndroidBackButton } from "../useAndroidBackButton";

export const AuthLayout = () => {
  const t = useTranslations("common");

  useAndroidBackButton();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="flex w-full max-w-md items-center justify-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MountainSnowIcon aria-hidden className="size-6 text-primary" />
          {t("brand")}
        </Link>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </main>
  );
};
