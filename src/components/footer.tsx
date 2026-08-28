import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-4xl text-center">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Clone of{" "}
        <a href="https://outbid.lol" target="_blank" rel="noopener noreferrer" className="text-primary transition-colors hover:text-primary/80">
          outbid.lol
        </a>{" "}
        · TEST MODE — no real payments ·{" "}
        <Link href="/stats" className="text-primary hover:text-primary/80">
          Live stats
        </Link>{" "}
        ·{" "}
        <Link href="/daily" className="text-primary hover:text-primary/80">
          Daily
        </Link>{" "}
        ·{" "}
        <Link href="/categories" className="text-primary hover:text-primary/80">
          Categories
        </Link>{" "}
        ·{" "}
        <Link href="/about" className="text-primary hover:text-primary/80">
          About
        </Link>
      </p>

      {/* Domain Rating badge */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground/60">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
          <span className="font-bold text-primary">41</span> outbid.lol — certified domain rating ·{" "}
          <a href="https://outbid.lol" target="_blank" rel="noopener noreferrer" className="underline">
            check
          </a>
        </span>
        <span>Built with Next.js 16 · Tailwind v4 · Supabase</span>
      </div>
    </footer>
  );
}
