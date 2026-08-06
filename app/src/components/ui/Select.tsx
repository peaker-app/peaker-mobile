"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    className={cn(
      "flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-start",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon aria-hidden className="size-4 shrink-0 opacity-60" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

export const SelectContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      position="popper"
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-md",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

export const SelectItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-md py-2 pe-8 ps-2 text-sm text-start outline-none",
      "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute end-2 flex size-4 items-center justify-center">
      <CheckIcon aria-hidden className="size-4" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
);
