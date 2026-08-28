"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Search, Sun } from "lucide-react";
import { useTheme } from "./theme";
import { useViewMode } from "./view-mode";
import SearchModal from "./search-modal";

function LogoMark() {
  return (
    <svg viewBox="0 0 36 28" fill="none" aria-hidden className="h-5 w-auto shrink-0">
      <rect x="22" y="0" width="14" height="6" rx="3" fill="var(--primary)" />
      <rect x="12" y="11" width="24" height="6" rx="3" fill="var(--foreground)" />
      <rect x="0" y="22" width="36" height="6" rx="3" fill="var(--foreground)" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/daily", label: "Daily" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const { mode, setMode } = useViewMode();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-[56px] max-w-6xl items-center gap-2 px-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-1.5 text-[18px] font-semibold tracking-[-0.03em]">
            <LogoMark />
            <span>
              openoutbid<span className="text-primary">.</span>com
            </span>
          </Link>

          {/* All-time / Today toggle */}
          <div className="ml-2 hidden items-center rounded-full bg-muted p-1 sm:flex">
            <button
              onClick={() => setMode("alltime")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${mode === "alltime" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              All-time
            </button>
            <button
              onClick={() => setMode("today")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${mode === "today" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Today
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Nav links - desktop */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 font-medium transition-colors ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Search size={16} />
          </button>

          {/* Dark toggle */}
          <button
            onClick={toggle}
            aria-label={dark ? "Light mode" : "Dark mode"}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile nav row */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 scrollbar-none md:hidden">
          {/* mobile All-time/Today */}
          <div className="mr-1 flex shrink-0 items-center rounded-full bg-muted p-1">
            <button
              onClick={() => setMode("alltime")}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${mode === "alltime" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              All-time
            </button>
            <button
              onClick={() => setMode("today")}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${mode === "today" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              Today
            </button>
          </div>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${pathname === l.href ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
