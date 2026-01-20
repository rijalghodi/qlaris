"use client";

import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { Input, type InputProps } from "./input";
import { forwardRef, useEffect, useState } from "react";

export type NumberInputProps = Omit<InputProps, "value" | "onChange" | "type"> & {
  value?: number;
  onChange?: (value: number | undefined) => void;
  withDelimiter?: boolean;
  step?: number;
  min?: number;
  max?: number;
};

function formatNumberWithDelimiter(value: number): string {
  return value.toLocaleString("id-ID");
}

function parseNumberFromDelimiter(value: string): number | undefined {
  const clean = value.replace(/\./g, "").replace(/,/g, "");
  if (clean === "") return undefined;
  const n = Number(clean);
  return Number.isNaN(n) ? undefined : n;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ name, value, onChange, withDelimiter = true, step = 1, min, max, ...props }, ref) => {
    const [display, setDisplay] = useState("");

    const handleChange = (value: string) => {
      let parsed: number | undefined;
      if (withDelimiter) {
        parsed = parseNumberFromDelimiter(value);
      } else {
        parsed = value === "" ? undefined : Number(value);
      }

      if (parsed !== undefined && min !== undefined && parsed < min) {
        return;
      }

      if (parsed !== undefined && max !== undefined && parsed > max) {
        return;
      }

      onChange?.(parsed);

      if (parsed === undefined) {
        setDisplay("");
      } else {
        setDisplay(withDelimiter ? formatNumberWithDelimiter(parsed) : String(parsed));
      }
    };

    const handleIncrement = () => {
      if (value === undefined) {
        handleChange?.(String(step));
      } else {
        handleChange?.(String(value + step));
      }
    };

    const handleDecrement = () => {
      if (value === undefined) {
        handleChange?.(String(-step));
      } else {
        handleChange?.(String(value - step));
      }
    };

    return (
      <Input
        ref={ref}
        id={name}
        type="text"
        name={name}
        value={display}
        onChange={(e) => {
          const str = e.target.value;
          handleChange(str);
        }}
        inputMode="numeric"
        rightSection={
          <div className="flex flex-col w-full max-w-5">
            <button
              className="flex-1 hover:bg-accent cursor-pointer flex justify-center items-center text-muted-foreground hover:text-foreground size-4 w-full"
              type="button"
              title="Increment"
              onClick={handleIncrement}
              tabIndex={-1}
            >
              <ChevronUp className="size-3!" />
            </button>
            <button
              className="flex-1 hover:bg-accent cursor-pointer flex justify-center items-center text-muted-foreground hover:text-foreground size-4 w-full"
              type="button"
              title="Decrement"
              onClick={handleDecrement}
              tabIndex={-1}
            >
              <ChevronDown className="size-3!" />
            </button>
          </div>
        }
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";
