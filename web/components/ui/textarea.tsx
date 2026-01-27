import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bg-input border-input",
        "rounded-md border bg-input px-2.5 py-2 text-base shadow-xs md:text-sm placeholder:text-muted-foreground",
        // focus-visible
        "focus-visible:bg-input/50 focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-1",
        // aria-invalid
        "aria-invalid:ring-[1px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
        // disabled
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        // transition
        "transition-[color,box-shadow]",
        "flex field-sizing-content min-h-16 w-full outline-none",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
