import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { extractConfirmationToken } from "@/lib/auth/confirmationToken";

export interface ConfirmTokenFormProps {
  onToken: (token: string) => void;
}

export const ConfirmTokenForm = ({ onToken }: ConfirmTokenFormProps) => {
  const t = useTranslations("auth.confirmEmail.manual");
  const [pasted, setPasted] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = extractConfirmationToken(pasted);

    if (token) {
      onToken(token);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg leading-relaxed font-semibold text-start">
          {t("title")}
        </h2>
        <p className="max-w-prose leading-relaxed text-muted-foreground text-start">
          {t("body")}
        </p>
      </header>

      <FormField id="confirmation-token" label={t("label")} help={t("help")}>
        {({ describedBy }) => (
          <Textarea
            id="confirmation-token"
            rows={2}
            dir="ltr"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby={describedBy}
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
          />
        )}
      </FormField>

      <Button type="submit">{t("submit")}</Button>
    </form>
  );
};
