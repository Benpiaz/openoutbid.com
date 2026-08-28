import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CopyLinkButton from "@/components/copy-link-button";
import { timeAgo } from "@/components/leaderboard-row";
import { getAllProducts, getProductBySlug } from "@/lib/db";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getAllProducts();
  const sorted = [...all].sort((a, b) => b.currentBid - a.currentBid);
  const rank = sorted.findIndex((p) => p.slug === slug) + 1;

  const inCategory = sorted.filter((p) => p.category === product.category);
  const categoryRank = inCategory.findIndex((p) => p.slug === slug) + 1;
  const categoryTotal = inCategory.length;
  const boardTotal = all.length;
  const letter = (product.name?.charAt(0) || "?").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/leaderboard" className="transition-colors hover:text-foreground">
            Leaderboard
          </Link>
          <span>·</span>
          <Link href={`/categories`} className="transition-colors hover:text-foreground">
            {product.category}
          </Link>
          <span>·</span>
          <span className="font-medium text-foreground">{product.name}</span>
        </nav>

        {/* Hero */}
        <div className="mt-6 flex gap-4">
          {product.logo && /^https?:\/\//.test(product.logo) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.logo} alt={product.name} className="size-16 shrink-0 rounded-2xl border border-border bg-white object-cover" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted text-xl font-bold text-muted-foreground">
              {letter}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold leading-tight">
              {product.name}
              <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                #{rank}
              </span>
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/60">
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-primary/80">
                {product.domain} <ExternalLink size={11} />
              </a>
              <span>· {product.clicks.toLocaleString()} clicks</span>
              <span>· {timeAgo(product.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Spent</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-primary">${product.currentBid.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Current bid on the board</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Category rank</p>
            <p className="mt-1 text-xl font-bold">
              #{categoryRank} <span className="text-sm font-normal text-muted-foreground">of {categoryTotal}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">in {product.category}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Overall</p>
            <p className="mt-1 text-xl font-bold">
              #{rank} <span className="text-sm font-normal text-muted-foreground">of {boardTotal}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">on the board</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Domain</span>
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                {product.domain}
              </a>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Handle</span>
              <span className="font-medium">{product.handle || "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{new Date(product.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Clicks</span>
              <span className="font-medium tabular-nums">{product.clicks.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Visit website <ExternalLink size={14} />
            </a>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-6 font-semibold transition-colors hover:bg-muted ease-soft"
            >
              Claim rank — ${product.currentBid + 1}
            </Link>
            <CopyLinkButton url={product.url} />
          </div>
        </div>

        <div className="mt-10">
          <Footer />
        </div>
      </main>
    </div>
  );
}
