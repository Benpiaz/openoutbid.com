"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";
import type { Product } from "@/lib/data";
import { resolveCategoryIcon } from "@/lib/category-icons";

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.floor(days / 30);
  return `${mo}mo ago`;
}

export default function LeaderboardRow({
  product,
  rank,
  categoryRank,
  showTopStyle = true,
}: {
  product: Product;
  rank: number;
  categoryRank?: number;
  showTopStyle?: boolean;
}) {
  const isTop3 = showTopStyle && rank <= 3;
  const Icon = resolveCategoryIcon(product.category as string);
  const letter = (product.name.charAt(0) || "?").toUpperCase();
  const rankLabel = `#${rank}`;

  if (isTop3) {
    const borderCls =
      rank === 1
        ? "border-2 border-primary bg-primary/20"
        : rank === 2
          ? "border border-primary/40 bg-primary/8"
          : "border border-primary/15 bg-primary/[0.04]";
    return (
      <Link
        href={`/p/${product.slug}`}
        className={`my-3 flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors hover:brightness-[0.99] ${borderCls}`}
      >
        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{rankLabel}</span>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {letter}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight">{product.name}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted-foreground">{product.tagline}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1 text-[11px] leading-none text-muted-foreground/60">
            {categoryRank !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Icon size={11} />
                #{categoryRank} in {product.category}
              </span>
            )}
            <span>· {timeAgo(product.createdAt)}</span>
            <span>· {product.domain}</span>
            <span>· {product.clicks.toLocaleString()} clicks</span>
            <span className="text-primary">· see details →</span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold tabular-nums">${product.currentBid.toLocaleString()}</span>
          <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-muted-foreground/50">
            <Clock3 size={10} />
            {timeAgo(product.createdAt)}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/p/${product.slug}`}
      className="flex items-center gap-3 border-t border-border py-3.5 transition-colors hover:text-primary"
    >
      <span className="inline-flex min-w-9 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground">{rankLabel}</span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {letter}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-tight">{product.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{product.tagline}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground/60">
          {categoryRank !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Icon size={11} />
              {product.category}
            </span>
          )}
          <span>· {product.domain}</span>
          <span>· {product.clicks.toLocaleString()} clicks</span>
          <span className="hidden text-primary sm:inline">· see details →</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-medium tabular-nums">${product.currentBid.toLocaleString()}</span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground/50">{timeAgo(product.createdAt)}</span>
      </span>
    </Link>
  );
}
