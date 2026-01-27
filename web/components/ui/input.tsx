"use client";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import * as React from "react";

const inputVariants = cva("", {
  variants: {
    error: {
      true: "border-destructive",
      false:
        "border-input focus-within:ring-0 focus-within:border-primary/50 focus-within:ring-primary/50",
    },
  },
  defaultVariants: {
    error: false,
  },
});

export type InputProps = React.ComponentProps<"input"> & {
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  inputClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, name, leftSection, rightSection, inputClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          // Base styles
          "relative flex gap-1 items-stretch w-full h-9 rounded-full border py-0",
          "bg-input border-input",
          "transition-[color,box-shadow,border-color] [&_svg]:size-4 overflow-clip",
          // Focus state (when input inside is focused)
          "focus-within:bg-input/50 focus-within:border-ring focus-within:ring-ring focus-within:ring-1",
          // Error state (when input has aria-invalid)
          "[&:has(input[aria-invalid=true])]:border-destructive [&:has(input[aria-invalid=true])]:ring-destructive [&:has(input[aria-invalid=true])]:ring-1 [&:has(input[aria-invalid=true])]:bg-input/50",
          "dark:[&:has(input[aria-invalid=true])]:ring-destructive/40 dark:[&:has(input[aria-invalid=true])]:border-destructive/50",
          // Disabled state (when input is disabled)
          "[&:has(input:disabled)]:opacity-50 [&:has(input:disabled)]:pointer-events-none [&:has(input:disabled)]:cursor-not-allowed",
          className
        )}
      >
        {leftSection && (
          <div className="flex justify-center items-center w-10 absolute left-0 h-full">
            {leftSection}
          </div>
        )}
        <input
          name={name}
          className={cn(
            "flex-1 focus-visible:outline-none border-none text-base sm:text-sm px-3.5",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
            "peer w-full",
            leftSection && "pl-10",
            rightSection && "pr-10",
            inputClassName
          )}
          ref={ref}
          {...props}
        />
        {rightSection && (
          <div className="flex justify-center items-center w-10 absolute right-0 h-full">
            {rightSection}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
