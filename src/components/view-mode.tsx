"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ViewMode = "alltime" | "today";

const ViewModeContext = createContext<{
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
} | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeRaw] = useState<ViewMode>("alltime");
  const setMode = useCallback((m: ViewMode) => setModeRaw(m), []);
  return <ViewModeContext.Provider value={{ mode, setMode }}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be inside ViewModeProvider");
  return ctx;
}
