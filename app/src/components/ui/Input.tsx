import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const Input = ({ className, ...props }: ComponentProps<"input">) => (
  <input
    className={cn(
      "flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-start",
      "placeholder:text-muted-foreground",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
      "aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);
