"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const RadioGroup = ({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) => (
  <RadioGroupPrimitive.Root className={cn("flex flex-col gap-3", className)} {...props} />
);

export const RadioGroupItem = ({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) => (
  <RadioGroupPrimitive.Item
    className={cn(
      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-input",
      "data-[state=checked]:border-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator>
      <CircleIcon aria-hidden className="size-2.5 fill-primary text-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);
