import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Testimonials from "@/components/testimonials";
import { getAllProducts } from "@/lib/db";

const PAGE_SIZE = 50;

export default async function LeaderboardPage() {
  const products = await getAllProducts();
  const sorted = [...products].sort((a, b) => b.currentBid - a.currentBid);
  const shown = sorted.slice(0, PAGE_SIZE);
  const totalRevenue = sorted.reduce((sum, p) => sum + p.currentBid, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 pt-10 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All-time ranking sorted by bid. Pay more to climb higher.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Total claimed</p>
            <p className="text-lg font-bold tabular-nums text-primary">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-card px-4 py-3 shadow-[0_12px_50px_rgba(30,41,59,0.08)] sm:px-7">
          {shown.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No products yet — be the first to claim #1!</div>
          ) : (
            <>
              {shown.map((p, idx) => {
                const rank = idx + 1;
                const letter = (p.name?.charAt(0) || "?").toUpperCase();
                if (rank <= 3) {
                  const rankCls =
                    rank === 1
                      ? "border-2 border-primary bg-primary/22"
                      : rank === 2
                        ? "border border-primary/40 bg-primary/8"
                        : "border border-primary/15 bg-primary/[0.03]";
                  return (
                    <a
                      key={p.id}
                      href={`/p/${p.slug}`}
                      className={`my-3 flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors hover:text-primary ${rankCls}`}
                    >
                      <span className="rounded-full bg-primary px-2 py-0.5 text-sm font-semibold text-primary-foreground">#{rank}</span>
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
                        {letter}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold leading-tight">{p.name}</span>
                        <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted-foreground">{p.tagline}</span>
                        <span className="mt-1 block text-[11px] text-muted-foreground/60">
                          {p.category} · {p.domain} · {p.clicks.toLocaleString()} clicks
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-semibold tabular-nums">${p.currentBid.toLocaleString()}</span>
                      </span>
                    </a>
                  );
                }
                return (
                  <a
                    key={p.id}
                    href={`/p/${p.slug}`}
                    className="flex items-center gap-3 border-t border-border py-3.5 transition-colors hover:text-primary"
                  >
                    <span className="inline-flex min-w-10 shrink-0 items-center justify-center text-base font-medium text-muted-foreground">
                      #{rank}
                    </span>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {letter}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium leading-tight">{p.name}</span>
                      <span className="block truncate text-sm text-muted-foreground">{p.tagline}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block tabular-nums">${p.currentBid.toLocaleString()}</span>
                    </span>
                  </a>
                );
              })}
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Showing {shown.length} of {sorted.length} products
        </p>

        <section className="mt-14">
          <h2 className="mb-4 text-center text-lg font-semibold">What makers are saying</h2>
          <Testimonials />
        </section>

        <div className="mt-16">
          <Footer />
        </div>
      </main>
    </div>
  );
}
