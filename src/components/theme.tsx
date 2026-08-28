"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ThemeCtx = { dark: boolean; toggle: () => void };

const Ctx = createContext<ThemeCtx>({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("outbid-theme") === "dark") setDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("outbid-theme", dark ? "dark" : "light");
  }, [dark]);

  return <Ctx.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
