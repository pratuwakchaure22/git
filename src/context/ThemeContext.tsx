import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

export const accentColors = [
  { name: "Teal", hex: "#2a8c82" },
  { name: "Blue", hex: "#4F7CFF" },
  { name: "Purple", hex: "#9B4DFF" },
  { name: "Amber", hex: "#FFC43D" },
  { name: "Emerald", hex: "#48C774" },
  { name: "Coral", hex: "#FF5C6C" },
];

interface ThemeContextValue {
  theme: ThemeMode;
  accentColor: string;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "dark";
}

function getInitialAccent(): string {
  if (typeof window === "undefined") return "#2a8c82";
  return window.localStorage.getItem("accentColor") || "#2a8c82";
}

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [accentColor, setAccentColorState] = useState<string>(getInitialAccent);

  useEffect(() => {
    const root = document.documentElement;
    window.localStorage.setItem("theme", theme);

    if (theme === "system") {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isSystemDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    window.localStorage.setItem("accentColor", accentColor);
    root.style.setProperty("--primary-accent", accentColor);
    root.style.setProperty("--primary-accent-rgb", hexToRgb(accentColor));
  }, [accentColor]);

  const setTheme = (mode: ThemeMode) => setThemeState(mode);
  const setAccentColor = (color: string) => setAccentColorState(color);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        setTheme,
        setAccentColor,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
