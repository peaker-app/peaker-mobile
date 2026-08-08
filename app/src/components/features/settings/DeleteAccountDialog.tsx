"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { buttonVariants, Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { clearTokens } from "@/lib/auth/tokenStore";
import { cn } from "@/lib/cn";

export interface DeleteAccountDialogProps {
  confirmationName: string;
}

export const DeleteAccountDialog = ({
  confirmationName,
}: DeleteAccountDialogProps) => {
  const t = useTranslations("settings.account.danger");
  const common = useTranslations("common.confirm");
  const toMessage = useProblemMessage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [failure, setFailure] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const matches = typed.trim() === confirmationName;

  const close = async () => {
    setBusy(true);
    setFailure(undefined);

    try {
      await apiFetch(endpoints.auth.deleteAccount, { method: "DELETE" });
      router.replace("/?deleted=1");
      await clearTokens();
      queryClient.clear();
    } catch (error) {
      setFailure(toMessage(error));
      setBusy(false);
    }
  };

  const consequences = ["data", "identity", "irreversible", "sessions"] as const;

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        {t("close")}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg leading-relaxed font-semibold">
              {t("confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="max-w-prose list-disc space-y-1 text-sm leading-relaxed text-muted-foreground ps-5 text-start">
                {consequences.map((key) => (
                  <li key={key}>{t(`consequences.${key}`)}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 flex flex-col gap-1.5">
            <Label htmlFor="deleteConfirmation">
              {t("confirmPrompt", { name: confirmationName })}
            </Label>
            <Input
              id="deleteConfirmation"
              dir="auto"
              autoComplete="off"
              aria-label={t("confirmLabel")}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
          </div>

          {failure ? (
            <p role="alert" className="mt-2 text-sm leading-relaxed text-destructive">
              {failure}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel
              autoFocus
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {common("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              disabled={!matches || busy}
              aria-disabled={!matches || busy}
              onClick={(event) => {
                event.preventDefault();
                void close();
              }}
            >
              {t("confirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
