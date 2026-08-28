import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Testimonials from "@/components/testimonials";
import { getAllProducts } from "@/lib/db";

export default async function AboutPage() {
  const products = await getAllProducts();
  const totalRevenue = products.reduce((sum, p) => sum + p.currentBid, 0);
  const topProduct = [...products].sort((a, b) => b.currentBid - a.currentBid)[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 pt-10 pb-16">
        <h1 className="text-2xl font-bold tracking-tight">About openoutbid.com</h1>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            openoutbid.com started as a simple side project: a leaderboard where the highest bidder claims{" "}
            <span className="font-semibold text-foreground">#1</span>. No voting, no algorithms — just money talks.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Then it went live. Makers started claiming ranks for their products, outbidding each other for the top spot, and the board
            became what you see today. Every dollar spent climbs the board, every claim is instant, and every product gets its own page.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-muted p-4 text-center">
              <p className="text-xl font-bold tabular-nums">{products.reduce((s, p) => s + p.clicks, 0).toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Total clicks served</p>
            </div>
            <div className="rounded-xl bg-muted p-4 text-center">
              <p className="text-xl font-bold tabular-nums">${totalRevenue.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Total claimed on the board</p>
            </div>
            <div className="rounded-xl bg-muted p-4 text-center">
              <p className="truncate text-xl font-bold">{topProduct ? topProduct.name : "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {topProduct ? `Current #1 · $${topProduct.currentBid.toLocaleString()}` : "Highest rank"}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="mb-4 text-center text-lg font-semibold">What makers are saying</h2>
          <Testimonials />
        </section>

        {/* Founder card */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            B
          </span>
          <p className="mt-3 text-sm font-semibold">benpiaz</p>
          <p className="text-xs text-muted-foreground">Founder of openoutbid.com</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            &ldquo;I wanted the most honest ranking on the internet. If you want #1, outbid the person holding it. That&apos;s it.&rdquo;
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-9 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Claim your rank
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">TEST MODE</span> — This clone runs without real payments. All bids are fake
          for demo purposes. Connect Stripe keys to go live.
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          Built by{" "}
          <a href="https://github.com/benpiaz" target="_blank" rel="noopener noreferrer" className="font-medium text-muted-foreground hover:text-primary">
            @benpiaz
          </a>{" "}
          · openoutbid.com
        </p>

        <div className="mt-10">
          <Footer />
        </div>
      </main>
    </div>
  );
}
