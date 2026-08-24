import { useTranslations } from "use-intl";
import { useIsOnline } from "@/lib/offline/connectivity";

export const OfflineBanner = () => {
  const t = useTranslations("offline");
  const online = useIsOnline();

  return online ? null : (
    <p
      role="status"
      className="bg-warning px-4 py-2 text-center text-sm leading-relaxed text-warning-foreground"
    >
      {t("banner")}
    </p>
  );
};
