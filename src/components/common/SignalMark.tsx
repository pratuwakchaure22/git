import { cn } from "@/lib/utils";

interface SignalMarkProps {
  className?: string;
  animate?: boolean;
}

/**
 * The site's signature motif: a signal/waveform trace.
 * Used large in the Hero, and small as a section divider / eyebrow mark elsewhere.
 */
export function SignalMark({ className, animate = false }: SignalMarkProps) {
  return (
    <svg
      viewBox="0 0 240 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 20 H24 L32 6 L42 34 L52 20 L60 20 L68 12 L76 28 L84 20 H100 L108 4 L118 36 L128 20 L136 20 L144 14 L152 26 L160 20 H240"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "signal-path" : undefined}
      />
    </svg>
  );
}
