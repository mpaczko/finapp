import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

export const accentOptions = [
  {
    id: "sun",
    name: "Słoneczny",
    primary: "#f6c945",
    primaryHover: "#d9a62e",
    accentForeground: "#a75b00",
    onPrimary: "#172033",
  },
  {
    id: "coral",
    name: "Koralowy",
    primary: "#ef8c72",
    primaryHover: "#d9675b",
    accentForeground: "#ad3f36",
    onPrimary: "#172033",
  },
  {
    id: "raspberry",
    name: "Malinowy",
    primary: "#dd3d73",
    primaryHover: "#ba245c",
    accentForeground: "#a51f50",
    onPrimary: "#ffffff",
  },
  {
    id: "indigo",
    name: "Indygo",
    primary: "#46478f",
    primaryHover: "#33346f",
    accentForeground: "#303169",
    onPrimary: "#ffffff",
  },
  {
    id: "finance-green",
    name: "Zielony",
    primary: "#0b6e4f",
    primaryHover: "#064635",
    accentForeground: "#07533d",
    onPrimary: "#ffffff",
  },
  {
    id: "red",
    name: "Czerwony",
    primary: "#dc2626",
    primaryHover: "#991b1b",
    accentForeground: "#a51d1d",
    onPrimary: "#ffffff",
  },
  {
    id: "blue",
    name: "Niebieski",
    primary: "#2d58e7",
    primaryHover: "#2449c9",
    accentForeground: "#2449c9",
    onPrimary: "#ffffff",
  },
  {
    id: "mint",
    name: "Miętowy",
    primary: "#48c8a7",
    primaryHover: "#2da88a",
    accentForeground: "#167a66",
    onPrimary: "#172033",
  },
  {
    id: "ice",
    name: "Lodowy błękit",
    primary: "#d0eef8",
    primaryHover: "#8bd0e5",
    accentForeground: "#246f88",
    onPrimary: "#172033",
  },
] as const;

export type AccentColor = (typeof accentOptions)[number]["id"];

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (accentColor: AccentColor) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readStoredTheme(): Theme {
  try {
    return window.localStorage.getItem("finapp.theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export function readStoredAccentColor(): AccentColor {
  try {
    const storedAccentColor = window.localStorage.getItem(
      "finapp.accent-color",
    );
    return accentOptions.some((option) => option.id === storedAccentColor)
      ? (storedAccentColor as AccentColor)
      : "blue";
  } catch {
    return "blue";
  }
}

export function applyAccentColor(accentColor: AccentColor) {
  const option = accentOptions.find((item) => item.id === accentColor);
  if (!option) return;

  const root = document.documentElement;
  root.style.setProperty("--app-primary", option.primary);
  root.style.setProperty("--app-primary-hover", option.primaryHover);
  root.style.setProperty(
    "--app-primary-gradient",
    `linear-gradient(135deg, ${option.primary}, ${option.primaryHover})`,
  );
  root.style.setProperty(
    "--app-primary-hover-gradient",
    `linear-gradient(135deg, ${option.primaryHover}, ${option.primary})`,
  );
  root.style.setProperty("--app-accent-foreground", option.accentForeground);
  root.style.setProperty("--app-info", option.primary);
  root.style.setProperty("--app-feature", option.primaryHover);
  root.style.setProperty("--app-on-primary", option.onPrimary);
  root.style.setProperty(
    "--app-accent",
    `color-mix(in srgb, ${option.primary} 16%, var(--app-surface))`,
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
