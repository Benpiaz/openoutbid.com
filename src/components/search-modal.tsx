"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { mapRowToProduct } from "@/lib/db";
import type { Product } from "@/lib/data";

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("products")
      .select("*")
      .order("current_bid", { ascending: false })
      .then(({ data }) => setAll((data ?? []).map(mapRowToProduct)));
  }, [open]);

  useEffect(() => {
    const s = q.trim().toLowerCase();
    if (!s) {
      setResults([]);
      return;
    }
    setResults(
      all
        .filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.tagline.toLowerCase().includes(s) ||
            p.domain.toLowerCase().includes(s) ||
            p.category.toLowerCase().includes(s),
        )
        .slice(0, 12),
    );
  }, [q, all]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl px-4 pt-16">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
          <div className="relative flex items-center gap-2">
            <Search size={16} className="shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, domains, categories…"
              className="h-9 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={onClose}
              aria-label="Close search"
              className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>

          {q.trim() && (
            <div className="mt-4 border-t border-border pt-3">
              {results.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No results for &ldquo;{q}&rdquo;</p>
              ) : (
                <ul className="space-y-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/p/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {(p.name.charAt(0) || "?").toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{p.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{p.category} · {p.domain}</span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">${p.currentBid.toLocaleString()}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!q.trim() && <p className="mt-4 text-center text-xs text-muted-foreground">Type to search the leaderboard</p>}
        </div>
      </div>
      {/* click-away */}
      <button aria-label="Close" onClick={onClose} className="flex-1" />
    </div>
  );
}
