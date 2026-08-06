import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const Skeleton = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    aria-hidden
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
);
