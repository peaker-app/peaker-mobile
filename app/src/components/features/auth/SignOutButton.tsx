import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/session";

export const SignOutButton = () => {
  const t = useTranslations("settings.account.session");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const leave = async () => {
    setBusy(true);
    router.replace("/peaks");
    await signOut();
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      disabled={busy}
      aria-busy={busy}
      onClick={() => void leave()}
    >
      {t("signOut")}
    </Button>
  );
};
