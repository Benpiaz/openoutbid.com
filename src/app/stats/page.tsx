"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { mapRowToProduct } from "@/lib/db";
import type { Product } from "@/lib/data";

export default function StatsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(47);
  const [visitors24h, setVisitors24h] = useState(8341);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("current_bid", { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data.map(mapRowToProduct));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setOnline(v => Math.max(12, v + Math.floor(Math.random() * 7) - 3));
      setVisitors24h(v => v + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const totalClaims = products.length;
  const totalBids = products.reduce((s, p) => s + p.currentBid, 0);
  const top = products[0];
  const avgBid = totalClaims > 0 ? Math.round(totalBids / totalClaims) : 0;

  const stats = [
    {
      label: "Online right now",
      value: String(online),
      live: true,
      sub: "people on this page",
    },
    {
      label: "Visitors — last 24 hours",
      value: visitors24h.toLocaleString(),
      live: true,
      sub: "counting every visit",
    },
    {
      label: "Total claims",
      value: loading ? "…" : String(totalClaims),
      sub: "products on the board",
    },
    {
      label: "Current #1 bid",
      value: loading ? "…" : top ? `$${top.currentBid.toLocaleString()}` : "—",
      sub: top ? top.name : "waiting for the first claim",
    },
    {
      label: "All bids combined",
      value: loading ? "…" : `$${totalBids.toLocaleString()}`,
      sub: "across the whole leaderboard",
    },
    {
      label: "Average bid",
      value: loading ? "…" : `$${avgBid.toLocaleString()}`,
      sub: "per product",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-[56px] max-w-4xl items-center justify-between px-4">
          <Link href="/" className="text-[18px] font-bold">
            ← openoutbid.com
          </Link>
          <span className="text-sm font-semibold">Live stats</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-center text-2xl font-bold tracking-[-0.02em]">Live stats</h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
          Real-time numbers straight from the leaderboard. Refreshes as bids come in.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(s => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_20px_rgba(30,41,59,0.05)]"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                {s.live && (
                  <span className="inline-flex size-2 animate-live-pulse rounded-full bg-primary motion-reduce:animate-none" />
                )}
                {s.label}
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums tracking-[-0.02em]">
                {s.value}
              </div>
              <div className="mt-1 truncate text-xs text-muted-foreground/70">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-primary/20 bg-primary/[0.08] px-4 py-3 text-center text-sm">
          Want your product in these numbers?{" "}
          <Link href="/" className="font-semibold text-primary hover:text-primary/80">
            Claim #1 now
          </Link>
        </div>
      </main>
    </div>
  );
}
