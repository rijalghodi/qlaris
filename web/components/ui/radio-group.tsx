"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import * as React from "react";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    readOnly?: boolean;
  }
>(({ className, readOnly, disabled, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-5 w-5 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        "flex items-center justify-center",
        className,
        readOnly && "!opacity-100"
      )}
      disabled={readOnly || disabled}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioGroupItemButton = ({
  value,
  children,
  className,
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <label
      htmlFor={value}
      className={cn(
        "cursor-pointer p-1 flex items-center text-sm justify-center h-9 px-3 bg-white rounded-sm border gap-2 has-[[data-state=checked]]:text-primary has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5 hover:bg-muted",
        className
      )}
    >
      <RadioGroupItem id={value} value={value} className="hidden" />
      {children}
    </label>
  );
};

RadioGroupItemButton.displayName = "RadioGroupItemButton";

export { RadioGroup, RadioGroupItem, RadioGroupItemButton };
