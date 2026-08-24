import { useTranslations } from "use-intl";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { cancelLeave, confirmLeave, usePendingLeave } from "./unsavedChanges";

export const UnsavedChangesDialog = () => {
  const t = useTranslations("ascentForm");
  const pending = usePendingLeave();

  return (
    <ConfirmDialog
      open={pending !== undefined}
      onOpenChange={(open) => {
        if (!open) {
          cancelLeave();
        }
      }}
      title={t("leaveTitle")}
      description={t("unsavedChanges")}
      confirmLabel={t("leaveConfirm")}
      onConfirm={confirmLeave}
    />
  );
};
