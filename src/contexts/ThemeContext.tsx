import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "pulpy_theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    try {
      localStorage.setItem(STORAGE_KEY, "light");
    } catch {}
  }, []);

  const setTheme = (_t: Theme) => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
