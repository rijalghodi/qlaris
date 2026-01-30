"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cn } from "@/lib/utils";
import { MinusIcon } from "lucide-react";

function InputOTPRoot({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center gap-1 has-disabled:opacity-50",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive rounded-md has-aria-invalid:ring-[3px] flex items-center",
        className
      )}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "bg-input data-[active=true]:border-ring data-[active=true]:ring-ring data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive size-9 border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:ring-[1px] relative flex items-center justify-center data-[active=true]:z-10",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000 bg-foreground h-4 w-px" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="[&_svg:not([class*='size-'])]:size-4 flex items-center"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

type InputOTPProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  autoComplete?: string;
  pattern?: string;
  inputMode?: string;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
};

function InputOTP({
  value,
  onChange,
  maxLength = 6,
  disabled = false,
  autoComplete = "one-time-code",
  pattern = "\\d*",
  inputMode = "numeric",
  className,
  containerClassName,
  style,
}: InputOTPProps) {
  return (
    <InputOTPRoot
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      disabled={disabled}
      autoComplete={autoComplete}
      pattern={pattern}
      inputMode={inputMode as any}
      className={className}
      containerClassName={containerClassName}
      style={style}
    >
      {Array.from({ length: maxLength }).map((_, idx) => (
        <InputOTPGroup key={idx}>
          <InputOTPSlot key={idx} index={idx} />
        </InputOTPGroup>
      ))}
    </InputOTPRoot>
  );
}

export { InputOTPRoot, InputOTPGroup, InputOTPSlot, InputOTPSeparator, InputOTP };
