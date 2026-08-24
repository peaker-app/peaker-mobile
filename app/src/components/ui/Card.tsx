import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const Card = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn(
      "rounded-md border border-border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2
    className={cn("text-lg leading-relaxed font-semibold text-start", className)}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: ComponentProps<"p">) => (
  <p
    className={cn("text-sm text-muted-foreground text-start", className)}
    {...props}
  />
);

export const CardContent = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("flex flex-wrap items-center gap-3 p-6 pt-0", className)}
    {...props}
  />
);
