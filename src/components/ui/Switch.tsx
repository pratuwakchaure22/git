import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Switch({ checked, onChange, label, description, disabled, id, className }: SwitchProps) {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]",
          checked ? "bg-[#4F7CFF]" : "bg-[#2A2A3A]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={switchId}
              className="cursor-pointer text-xs font-medium text-[#F4F4F7]"
            >
              {label}
            </label>
          )}
          {description && <p className="text-[11px] text-[#9A9AA8]">{description}</p>}
        </div>
      )}
    </div>
  );
}
