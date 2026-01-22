"use client";

import { RadioGroup, RadioGroupItem } from "./radio-group";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import * as React from "react";

const radioInputVariants = cva("flex flex-col gap-1", {
  variants: {
    variant: {
      default: "",
      bordered:
        "border border-input rounded-md p-3 has-[[data-state=checked]]:text-primary has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5 hover:bg-muted/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type Option =
  | {
      label: string;
      value: string | boolean;
      description?: string;
    }
  | string;

export type RadioInputProps = {
  value?: string | boolean;
  onChange?: (value: string | boolean) => void;
  options: Option[];
  className?: string;
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  error?: boolean;
  variant?: "default" | "bordered";
};

export const RadioInput: React.FC<RadioInputProps> = ({
  value,
  onChange,
  options,
  className,
  name,
  readOnly,
  disabled,
  error,
  variant = "default",
}) => {
  const handleChange = (value: string) => {
    if (value === "true") {
      onChange?.(true);
    } else if (value === "false") {
      onChange?.(false);
    } else {
      onChange?.(value);
    }
  };

  return (
    <RadioGroup
      className={cn("grid gap-2", className)}
      value={String(value)}
      onValueChange={handleChange}
    >
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        const optionDescription = typeof option === "string" ? undefined : option.description;
        return (
          <label
            key={String(optionValue)}
            className={cn(
              radioInputVariants({ variant }),
              readOnly || disabled ? "cursor-text" : "cursor-pointer"
            )}
            htmlFor={`${name}-${optionValue}`}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value={String(optionValue)}
                id={`${name}-${optionValue}`}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && "border-destructive")}
              />
              <span className="text-sm">{optionLabel}</span>
            </div>
            {optionDescription && (
              <p className="text-sm text-muted-foreground pl-6">{optionDescription}</p>
            )}
          </label>
        );
      })}
    </RadioGroup>
  );
};
