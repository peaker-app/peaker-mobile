import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const alertVariants = cva(
  "flex w-full items-start gap-3 rounded-md border p-4 text-sm leading-relaxed text-start [&_svg]:mt-0.5 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-border bg-muted text-foreground",
        warning: "border-warning bg-warning/10 text-foreground",
        destructive: "border-destructive bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

export type AlertProps = ComponentProps<"div"> &
  VariantProps<typeof alertVariants>;

export const Alert = ({ className, variant, ...props }: AlertProps) => (
  <div className={cn(alertVariants({ variant }), className)} {...props} />
);

export const AlertTitle = ({ className, ...props }: ComponentProps<"p">) => (
  <p className={cn("font-medium", className)} {...props} />
);

export const AlertDescription = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div className={cn("text-muted-foreground max-w-prose", className)} {...props} />
);
