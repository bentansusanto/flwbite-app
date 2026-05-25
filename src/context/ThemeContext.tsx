"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";
export type BrandColor = "green" | "blue" | "orange" | "purple" | "rose";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  brandColor: BrandColor;
  setBrandColor: (color: BrandColor) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [brandColor, setBrandColorState] = useState<BrandColor>("green");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This code will only run on the client side
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "light"; // Default to light theme
    
    const savedColor = localStorage.getItem("brandColor") as BrandColor | null;
    const initialColor = savedColor || "green";

    setTheme(initialTheme);
    setBrandColorState(initialColor);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("brandColor", brandColor);
      document.documentElement.setAttribute("data-theme", brandColor);
    }
  }, [brandColor, isInitialized]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const setBrandColor = (color: BrandColor) => {
    setBrandColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, brandColor, setBrandColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
