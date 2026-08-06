"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type SliderProps = ComponentProps<typeof SliderPrimitive.Root> & {
  valueText?: string;
  thumbLabel?: string;
};

export const Slider = ({
  className,
  valueText,
  thumbLabel,
  ...props
}: SliderProps) => (
  <SliderPrimitive.Root
    className={cn(
      "relative flex w-full touch-none select-none items-center py-3",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-muted">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
    </SliderPrimitive.Track>
    {(props.value ?? props.defaultValue ?? [0]).map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        aria-label={thumbLabel}
        aria-valuetext={valueText}
        className="block size-5 rounded-full border-2 border-primary bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    ))}
  </SliderPrimitive.Root>
);
