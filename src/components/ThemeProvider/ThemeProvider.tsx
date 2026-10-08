import { useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  applyAccentColor,
  readStoredAccentColor,
  readStoredTheme,
  ThemeContext,
} from "./themeContext";

const STORAGE_KEY = "finapp.theme";
const ACCENT_COLOR_STORAGE_KEY = "finapp.accent-color";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(readStoredTheme);
  const [accentColor, setAccentColor] = useState(readStoredAccentColor);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The selection still works for the current session.
    }
  }, [theme]);

  useLayoutEffect(() => {
    applyAccentColor(accentColor);
    try {
      window.localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, accentColor);
    } catch {
      // The selection still works for the current session.
    }
  }, [accentColor]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, accentColor, setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
