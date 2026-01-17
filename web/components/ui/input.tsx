// import * as React from "react";

// import { cn } from "@/lib/utils";

// function Input({ className, type, ...props }: React.ComponentProps<"input">) {
//   return (
//     <input
//       type={type}
//       data-slot="input"
//       className={cn(
//         "dark:bg-input/30 bg-input focus-visible:bg-input/50 border-input focus-visible:border-ring focus-visible:ring-ring aria-invalid:ring-destructive aria-invalid:bg-input/50 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-10 rounded-full border px-4 py-1 text-base transition-[color,box-shadow] file:h-7 file:text-sm file:font-medium focus-visible:ring-1 aria-invalid:ring-1 file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
//         className
//       )}
//       {...props}
//     />
//   );
// }

// export { Input };

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
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, name, leftSection, rightSection, ...props }, ref) => {
    return (
      <div
        className={cn(
          // Base styles
          "flex gap-1 items-stretch w-full h-10 rounded-full border px-4 py-1",
          "dark:bg-input/30 bg-input border-input",
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
          <div className="flex justify-center items-center min-w-4 px-1">{leftSection}</div>
        )}
        <input
          name={name}
          className={cn(
            "flex-1 focus-visible:outline-none border-none text-base sm:text-sm",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
            "peer w-full",
            leftSection && "pl-0",
            rightSection && "pr-0"
          )}
          ref={ref}
          {...props}
        />
        {rightSection && (
          <div className="flex justify-center items-center min-w-6 px-2">{rightSection}</div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
