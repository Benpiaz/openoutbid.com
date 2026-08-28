import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getAllProducts } from "@/lib/db";
import type { Product } from "@/lib/data";

function utcDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function formatDay(dateStr: string, today: string, yesterday: string): string {
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function DailyPage() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  const products = await getAllProducts();

  // Group by UTC date, newest first
  const byDay = new Map<string, Product[]>();
  for (const p of products) {
    const day = utcDate(p.createdAt);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(p);
  }
  const days = [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, items]) => ({
      day,
      items: items.sort((a, b) => b.currentBid - a.currentBid),
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 pt-10 pb-16">
        <h1 className="text-2xl font-bold tracking-tight">Daily Ranking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every day is its own board. Claim a rank for today — it closes at midnight UTC and never reopens.
        </p>

        {days.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
            No claims today —{" "}
            <Link href="/" className="text-primary underline">
              be the first to claim #1!
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {days.map(({ day, items }) => {
              const isToday = day === today;
              const shown = isToday ? items : items.slice(0, 3);
              return (
                <section key={day}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{formatDay(day, today, yesterday)}</h2>
                    {isToday ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <span className="size-1.5 animate-live-pulse rounded-full bg-primary motion-reduce:animate-none" />
                        Live · Open · {items.length} listing{items.length === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Closed · {items.length} listing{items.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  {isToday && (
                    <p className="mt-1 text-xs text-muted-foreground">This day is still open for claims. It closes at midnight UTC.</p>
                  )}

                  <div className="mt-3 rounded-2xl bg-card px-4 py-2 shadow-[0_12px_50px_rgba(30,41,59,0.06)] sm:px-7">
                    {shown.map((p, idx) => {
                      const letter = (p.name?.charAt(0) || "?").toUpperCase();
                      return (
                        <Link
                          key={p.id}
                          href={`/p/${p.slug}`}
                          className="flex items-center gap-3 border-t border-border py-3.5 transition-colors first:border-t-0 hover:text-primary"
                        >
                          <span className="inline-flex min-w-9 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                            {letter}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium leading-tight">{p.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{p.tagline}</span>
                          </span>
                          <span className="shrink-0 text-sm font-medium tabular-nums">${p.currentBid.toLocaleString()}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {isToday ? (
                    <Link
                      href="/"
                      className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Claim a rank
                    </Link>
                  ) : (
                    items.length > 3 && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        +{items.length - 3} more on this day&apos;s board
                      </p>
                    )
                  )}
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-16">
          <Footer />
        </div>
      </main>
    </div>
  );
}
