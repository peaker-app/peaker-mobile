"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogTitle = AlertDialogPrimitive.Title;
export const AlertDialogDescription = AlertDialogPrimitive.Description;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;

export const AlertDialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60" />
    <AlertDialogPrimitive.Content
      className={cn(
        "fixed top-1/2 start-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-y-1/2 rtl:translate-x-1/2 ltr:-translate-x-1/2",
        "rounded-md border border-border bg-card p-6 text-card-foreground shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </AlertDialogPrimitive.Portal>
);

export const AlertDialogHeader = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-2 text-start", className)} {...props} />
);

export const AlertDialogFooter = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn("mt-6 flex flex-wrap justify-end gap-3", className)}
    {...props}
  />
);
