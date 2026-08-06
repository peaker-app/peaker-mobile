"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type PasswordFieldProps = Omit<ComponentProps<"input">, "type">;

export const PasswordField = (props: PasswordFieldProps) => {
  const t = useTranslations("auth.fields");
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="pe-12"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute end-0 size-11"
      >
        {visible ? (
          <EyeOffIcon aria-hidden className="size-4" />
        ) : (
          <EyeIcon aria-hidden className="size-4" />
        )}
      </Button>
    </div>
  );
};
