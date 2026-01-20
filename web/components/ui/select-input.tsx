"use client";

import { Plus } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";
import * as React from "react";

interface SelectInputProps {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  options?: Array<{ label: string; value: string } | string>;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  focusStyle?: "default" | "none";
  withCreate?: boolean;
  onCreate?: () => void;
  createLabel?: string;
  container?: Element | DocumentFragment | null | undefined;
  error?: string;
}

export function SelectInput({
  value,
  onChange,
  placeholder,
  options,
  disabled,
  readOnly,
  className,
  focusStyle,
  container,
  withCreate,
  onCreate,
  createLabel,
  error,
  ...props
}: SelectInputProps) {
  // Track if this is the initial render to prevent Radix Select's initialization onValueChange
  const isInitialRenderRef = React.useRef(true);
  const lastValueRef = React.useRef<string | undefined>(value);

  // Update refs after render and when value changes from parent
  React.useLayoutEffect(() => {
    isInitialRenderRef.current = false;
  });

  React.useEffect(() => {
    // Update lastValueRef when value prop changes from parent
    lastValueRef.current = value;
  }, [value]);

  if (readOnly) {
    const valueObj = options?.find((option) =>
      typeof option === "string" || typeof option === "number"
        ? option === value
        : option.value === value
    );
    const valueLabel =
      typeof valueObj === "string" || typeof valueObj === "number"
        ? String(valueObj)
        : valueObj?.label;

    return (
      <Input
        value={valueLabel}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        {...props}
      />
    );
  }

  // Radix Select requires a string value, not undefined
  // Convert undefined to empty string for Radix, but maintain undefined in form state
  // Also convert numbers to strings for Radix compatibility
  const selectValue = value !== undefined ? String(value) : "";

  return (
    <Select
      value={selectValue}
      onValueChange={(currentValue) => {
        // Ignore onChange during initial render (Radix Select might trigger it)
        if (isInitialRenderRef.current) {
          return;
        }

        // Convert empty string back to undefined for form state consistency
        let normalizedValue: string | undefined = currentValue === "" ? undefined : currentValue;

        // Validate that the value matches an option (if it's not undefined/empty)
        if (normalizedValue !== undefined && normalizedValue !== "") {
          const isValidOption = options?.some((option) => {
            const optionValue =
              typeof option === "string" || typeof option === "number" ? option : option.value;
            return String(optionValue) === normalizedValue;
          });

          // If it's not a valid option, don't update (Radix might be confused)
          if (!isValidOption) {
            console.warn(
              `SelectInput: Ignoring invalid value "${normalizedValue}" that doesn't match any option`
            );
            return;
          }

          // Convert back to number if the original option was a number
          const matchedOption = options?.find((option) => {
            const optionValue =
              typeof option === "string" || typeof option === "number" ? option : option.value;
            return String(optionValue) === normalizedValue;
          });
          const matchedValue =
            typeof matchedOption === "string" || typeof matchedOption === "number"
              ? matchedOption
              : matchedOption?.value;
          if (typeof matchedValue === "number") {
            normalizedValue = matchedValue;
          }
        }

        // Only call onChange if the value actually changed from what we expect
        if (normalizedValue !== lastValueRef.current) {
          lastValueRef.current = normalizedValue;
          onChange?.(normalizedValue);
        }
      }}
      {...props}
    >
      <SelectTrigger
        disabled={disabled}
        className={cn(
          !value && "text-muted-foreground",
          !!error && "border-destructive",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <SelectValue placeholder={placeholder} className="" />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        <SelectGroup>
          {withCreate && (
            <Button
              onClick={onCreate}
              variant="ghost"
              className="w-full justify-start px-2 text-sm font-normal"
            >
              <Plus className="size-3.5!" /> {createLabel ?? "Create New"}
            </Button>
          )}
          {options && options?.length > 0 ? (
            options.map((option, index) => {
              const label =
                typeof option === "string" || typeof option === "number"
                  ? String(option)
                  : option.label;
              const value =
                typeof option === "string" || typeof option === "number"
                  ? String(option)
                  : String(option.value);
              return (
                <SelectItem
                  key={index}
                  value={value}
                  onClick={() => console.log("value123", value)}
                >
                  {label}
                </SelectItem>
              );
            })
          ) : (
            <SelectItem disabled value="#" className="text-center items-center justify-center h-16">
              No options available
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export type { SelectInputProps };
