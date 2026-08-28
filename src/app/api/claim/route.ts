import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Category } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl: string = (body.url ?? "").trim();
    const category: string = (body.category ?? "").trim();
    const bid: number = Number(body.bid);

    if (!rawUrl) return NextResponse.json({ error: "Missing URL or @handle" }, { status: 400 });
    if (!CATEGORIES.includes(category as Category))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    if (!Number.isFinite(bid) || bid < 1) return NextResponse.json({ error: "Invalid bid" }, { status: 400 });

    // Normalize fields
    const isHandle = rawUrl.startsWith("@");
    const url = isHandle ? `https://x.com/${rawUrl.slice(1)}` : rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    let domain: string;
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      domain = rawUrl.replace(/^https?:\/\//, "").split("/")[0] || rawUrl;
    }
    const handle = isHandle ? rawUrl : `@${domain.split(".")[0]}`;
    const name = isHandle ? rawUrl : domain;
    const baseSlug =
      rawUrl
        .replace(/^https?:\/\//, "")
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()
        .replace(/^-|-$/g, "")
        .slice(0, 24) || "new-product";
    // Ensure unique slug (append short random suffix)
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("products")
      .insert({
        slug,
        name,
        tagline: "Just claimed #1 — check it out!",
        description: "Newly claimed product on outbid.lol clone",
        url,
        domain,
        handle,
        logo: "🚀",
        logo_bg: "#3b82f6",
        category,
        current_bid: Math.floor(bid),
        clicks: 0,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("claim insert error", error);
      // unique violation → retry with different slug once
      if (error.code === "23505") {
        const retrySlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        const retry = await supabase
          .from("products")
          .insert({
            slug: retrySlug,
            name,
            tagline: "Just claimed #1 — check it out!",
            description: "Newly claimed product on outbid.lol clone",
            url,
            domain,
            handle,
            logo: "🚀",
            logo_bg: "#3b82f6",
            category,
            current_bid: Math.floor(bid),
            clicks: 0,
            created_at: now,
          })
          .select()
          .single();
        if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 });
        return NextResponse.json({ product: retry.data }, { status: 201 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
