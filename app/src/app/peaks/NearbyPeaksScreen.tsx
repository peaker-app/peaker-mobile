import { useTranslations } from "use-intl";
import { NearbyPeaksView } from "@/components/features/peaks/NearbyPeaksView";

export const NearbyPeaksScreen = () => {
  const t = useTranslations("peaks.nearby");

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl leading-relaxed font-semibold text-start">
          {t("title")}
        </h1>
        <p className="leading-relaxed text-muted-foreground text-start">
          {t("subtitle")}
        </p>
      </header>
      <NearbyPeaksView />
    </main>
  );
};
