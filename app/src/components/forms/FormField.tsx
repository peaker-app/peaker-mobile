"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/Label";

export interface FormFieldProps {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: (ids: { describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

export const FormField = ({
  id,
  label,
  help,
  error,
  children,
}: FormFieldProps) => {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : undefined, help ? helpId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({ describedBy, invalid: error !== undefined })}
      {error ? (
        <p id={errorId} className="text-sm leading-relaxed text-destructive text-start">
          {error}
        </p>
      ) : null}
      {help ? (
        <p
          id={helpId}
          className="max-w-prose text-sm leading-relaxed text-muted-foreground text-start"
        >
          {help}
        </p>
      ) : null}
    </div>
  );
};
