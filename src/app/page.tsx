"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Globe, X } from "lucide-react";
import { CATEGORIES, type Product, type Category } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { mapRowToProduct } from "@/lib/db";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CategoryPills from "@/components/category-pills";
import LeaderboardRow, { timeAgo } from "@/components/leaderboard-row";
import { useViewMode } from "@/components/view-mode";
import { useLiveStats } from "@/lib/use-live-stats";
import CheckoutModal from "@/components/checkout-modal";

const PAGE_SIZE = 25;
const DAY_MS = 24 * 60 * 60 * 1000;

function HomeInner() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat") ?? "";
  const initialCat = (CATEGORIES as readonly string[]).includes(catParam) ? catParam : "";
  const { mode } = useViewMode();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimUrl, setClaimUrl] = useState("");
  const [claimCategory, setClaimCategory] = useState<Category | "">("");
  const [claimPrice, setClaimPrice] = useState(17005);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const liveStats = useLiveStats();
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedCategory(initialCat);
  }, [initialCat]);

  // Polar return: ?paid=OBB00001
  useEffect(() => {
    const paid = searchParams.get("paid");
    if (!paid) return;
    fetch(`/api/slot-order/${encodeURIComponent(paid)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.status === "paid") {
          setShowToast("Payment confirmed — your slot is live!");
          supabase.from("products").select("*").order("current_bid", { ascending: false }).then(({ data }) => {
            if (data) setProducts((data ?? []).map(mapRowToProduct));
          });
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from("products").select("*").order("current_bid", { ascending: false });
        if (error) throw error;
        setProducts((data ?? []).map(mapRowToProduct));
      } catch (e) {
        console.error("Failed to fetch products", e);
        setShowToast("Could not load products — please retry");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const max = Math.max(...products.map((p) => p.currentBid));
      setClaimPrice(max + 5);
    }
  }, [products]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(null), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [mode, selectedCategory]);

  const allSorted = [...products].sort((a, b) => b.currentBid - a.currentBid);
  const topBid = allSorted[0]?.currentBid ?? 0;
  const takeoverPrice = topBid > 0 ? topBid * 5 : 1495;

  // View mode: All-time vs Today (last 24h)
  const cutoff = Date.now() - DAY_MS;
  const inWindow = mode === "today" ? allSorted.filter((p) => new Date(p.createdAt).getTime() >= cutoff) : allSorted;
  const filtered = selectedCategory ? inWindow.filter((p) => p.category === selectedCategory) : inWindow;

  // Pagination slice
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(safePage * PAGE_SIZE, total);
  const paged = filtered.slice(startIdx, endIdx);

  // Today's top ranking (top 3 of last 24h regardless of category filter)
  const todayTop = allSorted.filter((p) => new Date(p.createdAt).getTime() >= cutoff).slice(0, 3);

  // Latest activity — newest claims first
  const latest = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const handleClaim = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!claimUrl.trim()) {
      setShowToast("Please enter your product URL or @handle");
      return;
    }
    if (!claimCategory) {
      setShowToast("Please choose a category");
      return;
    }
    if (claimPrice < 2) {
      setShowToast("Minimum bid is $2");
      return;
    }
    setCheckoutOpen(true);
  };

  const handlePaid = async () => {
    setCheckoutOpen(false);
    setClaimUrl("");
    setPage(1);
    setShowToast("Payment confirmed — your slot is live!");
    try {
      const { data } = await supabase.from("products").select("*").order("current_bid", { ascending: false });
      if (data) setProducts((data ?? []).map(mapRowToProduct));
    } catch {}
  };

  const handleTakeover = () => {
    setClaimPrice(takeoverPrice);
    setShowToast(`Takeover price $${takeoverPrice.toLocaleString()} set — enter your URL and hit Outbid to own page 1.`);
    requestAnimationFrame(() => urlInputRef.current?.focus());
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 pt-10 pb-16 lg:px-8">
        {/* Live pill */}
        <div className="flex justify-center">
          <Link
            href="/stats"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <span className="size-2 animate-live-pulse rounded-full bg-green-500 motion-reduce:animate-none" />
            <span className="tabular-nums">
              {liveStats.live ? (
                <>
                  <span className="font-semibold text-foreground">{liveStats.online.toLocaleString()}</span> online
                  <span className="mx-1.5 text-border">·</span>
                  <span className="font-semibold text-foreground">{liveStats.visitors.toLocaleString()}</span> visitors
                  <span className="text-primary"> · see stats →</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-foreground">—</span> online
                  <span className="mx-1.5 text-border">·</span>
                  <span className="font-semibold text-foreground">—</span> visitors
                  <span className="text-muted-foreground"> · tracking live</span>
                </>
              )}
            </span>
          </Link>
        </div>

        {/* Hero */}
        <div className="mt-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[38px] font-bold tracking-[-0.03em] leading-none md:text-[56px]">
            <span>Claim #1 for</span>
            <span className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setClaimPrice((p) => Math.max(2, p - 1))}
                aria-label="Decrease price by $1"
                className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-[18px] leading-none text-primary transition-colors hover:bg-primary/25"
              >
                −
              </button>
              <span className="inline-flex items-baseline">
                <span>$</span>
                <input
                  inputMode="numeric"
                  aria-label="Bid amount in dollars"
                  value={String(claimPrice)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, "");
                    if (digits === "") setClaimPrice(0);
                    else setClaimPrice(parseInt(digits, 10));
                  }}
                  onBlur={() => setClaimPrice((p) => Math.max(2, Math.floor(p) || 2))}
                  className="min-w-[1.6ch] bg-transparent text-center tabular-nums underline decoration-2 decoration-dashed underline-offset-[6px] focus:outline-none"
                  style={{ width: `${Math.max(String(claimPrice).length, 1) + 0.6}ch` }}
                />
              </span>
              <button
                type="button"
                onClick={() => setClaimPrice((p) => p + 1)}
                aria-label="Increase price by $1"
                className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-[18px] leading-none text-primary transition-colors hover:bg-primary/25"
              >
                +
              </button>
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            Your amount decides the rank. Paying less than the #1 price still puts you on the board at whatever place that bid can take.
          </p>
        </div>

        {/* Claim form */}
        <form onSubmit={handleClaim} className="mx-auto mt-7 flex w-full max-w-3xl flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Globe size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={urlInputRef}
              value={claimUrl}
              onChange={(e) => setClaimUrl(e.target.value)}
              placeholder="Your product URL or @handle"
              className="h-12 w-full rounded-xl border border-input bg-card pr-4 pl-10 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </div>
          <div className="relative sm:w-[168px] sm:shrink-0">
            <select
              value={claimCategory}
              onChange={(e) => setClaimCategory(e.target.value as Category | "")}
              className="h-12 w-full appearance-none rounded-xl border border-input bg-card px-3 pr-8 text-sm text-muted-foreground focus:ring-2 focus:ring-ring/20 focus:outline-none"
            >
              <option value="" disabled>
                Category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <button
            type="submit"
            disabled={!claimUrl.trim() || !claimCategory}
            className="btn-shine h-[48px] shrink-0 rounded-full bg-primary px-8 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Outbid — ${claimPrice.toLocaleString()}
          </button>
        </form>

        {/* Takeover banner */}
        <div className="mx-auto mt-4 flex w-full max-w-3xl items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.08] px-5 py-3.5">
          <p className="text-sm leading-snug text-muted-foreground">
            <span className="font-semibold text-foreground">New:</span> Leaderboard takeover. Own the first page —{" "}
            <span className="font-semibold text-foreground">${takeoverPrice.toLocaleString()}</span>{" "}
            <span className="text-xs">(5× current #1)</span>
          </p>
          <button
            type="button"
            onClick={handleTakeover}
            className="h-6 shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Take over
          </button>
        </div>

        {/* Category pills */}
        <div className="mt-10">
          <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Leaderboard */}
        <div className="mt-8 rounded-2xl bg-card px-5 py-4 shadow-[0_12px_50px_rgba(30,41,59,0.08)] sm:px-8">
          <div className="flex items-center justify-between border-b border-border py-3">
            <h2 className="text-sm font-semibold">
              {mode === "today" ? "Today's leaderboard" : "All-time leaderboard"}
              {selectedCategory && <span className="ml-2 font-normal text-muted-foreground">· {selectedCategory}</span>}
            </h2>
            <span className="text-xs text-muted-foreground">
              {total} product{total === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading leaderboard…</div>
          ) : paged.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {mode === "today" ? "No claims in the last 24 hours — be the first!" : "No products yet — be the first to claim #1!"}
            </div>
          ) : (
            <div>
              {paged.map((p, i) => (
                <LeaderboardRow key={p.id} product={p} rank={startIdx + i + 1} categoryRank={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="h-8 rounded-full border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Prev
            </button>
            <p className="text-xs text-muted-foreground">
              Page {safePage} of {totalPages}
            </p>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="h-8 rounded-full border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* Today's top ranking */}
        {todayTop.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today&apos;s top ranking</h2>
              <Link href="/daily" className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80">
                View daily board <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-3 rounded-2xl bg-card px-4 py-2 shadow-[0_12px_50px_rgba(30,41,59,0.06)] sm:px-7">
              {todayTop.map((p, i) => (
                <LeaderboardRow key={p.id} product={p} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Latest activity */}
        {latest.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold">Latest activity</h2>
            <div className="mt-3 space-y-2">
              {latest.map((p) => (
                <Link
                  key={p.id}
                  href={`/p/${p.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {(p.name.charAt(0) || "?").toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground"> claimed ${p.currentBid.toLocaleString()}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(p.createdAt)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-16">
          <Footer />
        </div>
      </main>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        url={claimUrl}
        category={claimCategory as string}
        bid={Math.floor(claimPrice)}
        onPaid={handlePaid}
      />

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-foreground px-5 py-3 text-sm text-background shadow-xl">
          <span>{showToast}</span>
          <button onClick={() => setShowToast(null)} className="ml-1 opacity-60 hover:opacity-100" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
