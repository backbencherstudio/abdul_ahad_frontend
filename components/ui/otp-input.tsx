"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  className,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = React.useState<string[]>(new Array(length).fill(""));
  const prevValueRef = React.useRef<string>("");

  React.useEffect(() => {
    // Only update internal state if value prop actually changes
    if (value !== prevValueRef.current && value !== otp.join("")) {
      const otpArray = value.split("").slice(0, length);
      const newOtp = [...otpArray, ...new Array(length).fill("")].slice(
        0,
        length
      );
      setOtp(newOtp);
      prevValueRef.current = value;
    }
    // eslint-disable-next-line
  }, [value, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Update parent component
    onChange(newOtp.join(""));

    // Move to next input if current field is filled
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    const pastedArray = pastedData.split("").slice(0, length);

    const newOtp = [...pastedArray, ...new Array(length).fill("")].slice(
      0,
      length
    );
    setOtp(newOtp);
    onChange(newOtp.join(""));
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {otp.map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold border-2 border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] rounded-lg"
        />
      ))}
    </div>
  );
}
