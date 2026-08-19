import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-indigo hover:text-indigo ${className ?? ""}`}
    >
      {theme === "light" ? <Moon className="h-4 w-4" strokeWidth={1.75} /> : <Sun className="h-4 w-4" strokeWidth={1.75} />}
    </button>
  );
}
