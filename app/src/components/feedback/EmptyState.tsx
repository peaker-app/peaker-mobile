import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center gap-3 rounded-md border border-dashed border-border p-10 text-center",
      className,
    )}
  >
    {icon ? (
      <span aria-hidden className="text-muted-foreground">
        {icon}
      </span>
    ) : null}
    <p className="text-base leading-relaxed font-medium">{title}</p>
    {description ? (
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    ) : null}
    {action}
  </div>
);
