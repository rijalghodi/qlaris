"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { DeleteIcon } from "lucide-react";

export interface PinInputProps {
  /** Length of the PIN (number of digits) */
  length?: number;
  /** Current PIN value */
  value?: string;
  /** Callback when PIN value changes */
  onChange?: (value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Whether to mask the PIN with dots */
  masked?: boolean;
  /** Callback when PIN is complete */
  onComplete?: (value: string) => void;
}

export const PinInput = React.forwardRef<HTMLDivElement, PinInputProps>(
  ({ length = 4, value = "", onChange, disabled = false, className, onComplete }, ref) => {
    const handleNumberClick = (num: number) => {
      if (disabled || value.length >= length) return;

      const newValue = value + num.toString();
      onChange?.(newValue);

      if (newValue.length === length) {
        onComplete?.(newValue);
      }
    };

    const handleBackspace = () => {
      if (disabled || value.length === 0) return;
      const newValue = value.slice(0, -1);
      onChange?.(newValue);
    };

    const renderPinDots = () => {
      return (
        <div className="flex gap-5 justify-center mb-8 w-full">
          {Array.from({ length }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full border-2 transition-all",
                index < value.length
                  ? "bg-foreground border-foreground"
                  : "bg-transparent border-muted-foreground/30"
              )}
            />
          ))}
        </div>
      );
    };

    const numberButtons = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    return (
      <div ref={ref} className={cn("w-full max-w-xs mx-auto", className)}>
        {renderPinDots()}

        <div className="space-y-3">
          {/* Number rows 1-9 */}
          {numberButtons.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-3 justify-center">
              {row.map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="icon-lg"
                  onClick={() => handleNumberClick(num)}
                  disabled={disabled}
                  className={cn(
                    "w-16 h-16 text-lg font-medium rounded-full",
                    "hover:bg-accent hover:border-primary/50",
                    "active:scale-95 transition-transform"
                  )}
                >
                  {num}
                </Button>
              ))}
            </div>
          ))}

          {/* Bottom row with 0 and backspace */}
          <div className="flex gap-3 justify-center">
            {/* Empty space for alignment */}
            <div className="w-16 h-16" />

            {/* Zero button */}
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => handleNumberClick(0)}
              disabled={disabled}
              className={cn(
                "w-16 h-16 text-lg font-medium rounded-full",
                "hover:bg-accent hover:border-primary/50",
                "active:scale-95 transition-transform"
              )}
            >
              0
            </Button>

            {/* Backspace button */}
            <Button
              variant="outline"
              size="icon-lg"
              onClick={handleBackspace}
              disabled={disabled || value.length === 0}
              className={cn(
                "w-16 h-16 rounded-full",
                "hover:bg-accent hover:border-primary/50",
                "active:scale-95 transition-transform"
              )}
            >
              <DeleteIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

PinInput.displayName = "PinInput";
