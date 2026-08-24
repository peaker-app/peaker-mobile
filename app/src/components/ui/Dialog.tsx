"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export const DialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60" />
    <DialogPrimitive.Content
      className={cn(
        "fixed top-1/2 start-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-y-1/2 rtl:translate-x-1/2 ltr:-translate-x-1/2",
        "rounded-md border border-border bg-card p-6 text-card-foreground shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-2 text-start", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("mt-6 flex flex-wrap justify-end gap-3", className)}
    {...props}
  />
);
