"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import { ViewModeProvider } from "./view-mode";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ViewModeProvider>{children}</ViewModeProvider>
    </ThemeProvider>
  );
}
