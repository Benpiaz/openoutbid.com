import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CATEGORIES, type Category } from "@/lib/data";
import { resolveCategoryIcon } from "@/lib/category-icons";
import { getAllProducts } from "@/lib/db";

export default async function CategoriesPage() {
  const products = await getAllProducts();

  const stats = CATEGORIES.map((cat: Category) => {
    const inCat = products
      .filter((p) => p.category === cat)
      .sort((a, b) => b.currentBid - a.currentBid);
    return {
      cat,
      count: inCat.length,
      topBid: inCat[0]?.currentBid ?? 0,
      top3: inCat.slice(0, 3),
    };
  });

  const mostActive = [...stats].sort((a, b) => b.count - a.count).filter((s) => s.count > 0).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse products by category. Claim #1 in your niche.</p>

        {mostActive.length > 0 && (
          <div className="mt-6">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Most active categories</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mostActive.map((s) => {
                const Icon = resolveCategoryIcon(s.cat);
                return (
                  <a
                    key={s.cat}
                    href={`/?cat=${encodeURIComponent(s.cat)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon size={12} />
                    {s.cat} · {s.count}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ cat, count, topBid, top3 }) => {
            const Icon = resolveCategoryIcon(cat);
            return (
              <div
                key={cat}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md ease-soft"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold transition-colors group-hover:text-primary">{cat}</span>
                    <span className="block text-xs text-muted-foreground">
                      {count} product{count === 1 ? "" : "s"}
                      {topBid > 0 && <> · Top ${topBid.toLocaleString()}</>}
                    </span>
                  </span>
                </div>
                {top3.length > 0 ? (
                  <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {top3.map((p, i) => (
                      <Link key={p.id} href={`/p/${p.slug}`} className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary">
                        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                          {i + 1}
                        </span>
                        <span className="truncate">{p.name}</span>
                        <span className="ml-auto shrink-0 tabular-nums">${p.currentBid.toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground/60">
                    Empty board —{" "}
                    <Link href="/" className="text-primary underline">
                      claim #1
                    </Link>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <Footer />
        </div>
      </main>
    </div>
  );
}
