import { useTranslations } from "use-intl";
import { ResendConfirmationCard } from "@/components/features/auth/ResendConfirmationCard";
import { Link } from "@/i18n/navigation";

export const ResendConfirmationScreen = () => {
  const t = useTranslations("auth.resend");

  return (
    <div className="flex flex-col gap-6">
      <ResendConfirmationCard />
      <p className="text-sm leading-relaxed text-muted-foreground text-start">
        <Link href="/confirm-email" className="font-medium text-foreground underline">
          {t("enterToken")}
        </Link>
      </p>
    </div>
  );
};
