import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "game";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setGameTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("dark", "game-theme", "light");
    
    // Add appropriate classes based on theme
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "game") {
      root.classList.add("game-theme");
    } else {
      root.classList.add("light");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "game";
      return "light";
    });
  };

  const setGameTheme = () => {
    setTheme("game");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setGameTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
