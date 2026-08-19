import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  inputClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  icon,
  iconPosition = "left",
  className,
  inputClassName,
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9A9AA8]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9AA8]">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-xl bg-[#1B1B28] border border-[#2A2A3A] px-3.5 py-2.5 text-xs text-[#F4F4F7] placeholder:text-[#9A9AA8]/60",
            "transition-all focus:border-[#4F7CFF] focus:outline-none shadow-inner",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[#FF5C6C] focus:border-[#FF5C6C]",
            icon && iconPosition === "left" && "pl-9",
            icon && iconPosition === "right" && "pr-9",
            inputClassName
          )}
          {...rest}
        />
        {icon && iconPosition === "right" && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9AA8]">
            {icon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-[#FF5C6C]">{error}</p>}
      {hint && !error && <p className="text-[11px] text-[#9A9AA8]">{hint}</p>}
    </div>
  );
}
