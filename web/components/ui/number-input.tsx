"use client";

import { Input, type InputProps } from "./input";
import { forwardRef, useEffect, useState } from "react";

export type NumberInputProps = Omit<InputProps, "value" | "onChange" | "type"> & {
  value?: number;
  onChange?: (value: number | undefined) => void;
  withDelimiter?: boolean;
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
  ({ name, value, onChange, withDelimiter = true, ...props }, ref) => {
    const [display, setDisplay] = useState("");

    // keep display synced with external value
    useEffect(() => {
      if (value === undefined) {
        setDisplay("");
      } else {
        setDisplay(withDelimiter ? formatNumberWithDelimiter(value) : String(value));
      }
    }, [value, withDelimiter]);

    return (
      <Input
        ref={ref}
        id={name}
        type={withDelimiter ? "text" : "number"}
        name={name}
        value={display}
        onChange={(e) => {
          const str = e.target.value;
          setDisplay(str); // always update input visually

          let parsed: number | undefined;
          if (withDelimiter) {
            // For currency, parse the formatted string
            parsed = parseNumberFromDelimiter(str);
          } else {
            // For regular numbers, parse directly
            parsed = str === "" ? undefined : Number(str);
          }

          if (parsed !== undefined && parsed > Number.MAX_SAFE_INTEGER) {
            return; // ignore too-big numbers
          }

          onChange?.(parsed);
        }}
        // inputMode={isCurrency ? "numeric" : undefined}
        inputMode="numeric"
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";
