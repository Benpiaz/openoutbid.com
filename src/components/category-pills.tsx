"use client";

import Link from "next/link";
import { HOME_PILLS } from "@/lib/data";

export default function CategoryPills({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {HOME_PILLS.map((p) => {
        const value = p.category ?? "";
        const active = selected === value;
        return (
          <button
            key={p.label}
            onClick={() => onSelect(value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {p.label}
          </button>
        );
      })}
      <Link
        href="/categories"
        className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Explore →
      </Link>
    </div>
  );
}
