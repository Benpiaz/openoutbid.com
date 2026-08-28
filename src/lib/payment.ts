import { getSupabaseAdmin } from "./supabase";
import type { Category } from "./data";
import { CATEGORIES } from "./data";

// ── Payment constants (override via env) ────────────────────────────────────
export const SEPAY_BANK_ACCOUNT = process.env.SEPAY_BANK_ACCOUNT || "04066911201";
export const SEPAY_BANK_NAME = process.env.SEPAY_BANK_NAME || "TPBank";
export const SEPAY_ACCOUNT_NAME = process.env.SEPAY_ACCOUNT_NAME || "NGUYỄN HIẾU THIỆN";
export const SEPAY_QR_BASE = "https://qr.sepay.vn/img";
// USD → VND rate used to price slots in VND for bank transfer
export const USD_TO_VND = Number(process.env.SEPAY_USD_TO_VND || 26000);

export type OrderMethod = "sepay" | "polar";

export interface SlotOrder {
  id: string;
  order_code: string;
  url: string;
  category: string;
  bid_usd: number;
  amount_vnd: number;
  method: OrderMethod;
  status: "pending" | "paid" | "expired" | "canceled";
  polar_checkout_id: string | null;
  sepay_transaction_id: string | null;
  product_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export const ORDER_EXPIRY_MS = 30 * 60 * 1000;

// ── Order creation ───────────────────────────────────────────────────────────
export async function createSlotOrder(opts: {
  url: string;
  category: string;
  bidUsd: number;
  method: OrderMethod;
}): Promise<SlotOrder> {
  const supabase = getSupabaseAdmin();
  const amountVnd = Math.max(1000, Math.round((opts.bidUsd * USD_TO_VND) / 1000) * 1000);

  // Generate order code: OBB + 5-digit zero-padded number (retry on collision)
  let orderCode = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const { count, error: countErr } = await supabase
      .from("slot_orders")
      .select("*", { count: "exact", head: true });
    if (countErr) throw new Error(countErr.message);

    orderCode = "OBB" + String((count || 0) + 1 + attempt).padStart(5, "0");
    const { data, error: insertErr } = await supabase
      .from("slot_orders")
      .insert({
        order_code: orderCode,
        url: opts.url,
        category: opts.category,
        bid_usd: opts.bidUsd,
        amount_vnd: amountVnd,
        method: opts.method,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (!insertErr) return data as SlotOrder;
    if (insertErr.code === "23505") continue; // unique collision — retry
    throw new Error(insertErr.message);
  }
  throw new Error("Failed to generate unique order code");
}

export async function getOrder(code: string): Promise<SlotOrder | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("slot_orders")
    .select("*")
    .eq("order_code", code)
    .maybeSingle();
  if (error || !data) return null;
  return data as SlotOrder;
}

export function isExpired(order: SlotOrder): boolean {
  return order.status === "pending" && Date.now() - new Date(order.created_at).getTime() > ORDER_EXPIRY_MS;
}

// ── Slot activation: insert product once payment is confirmed ────────────────
// Fetches the site's real title/description/favicon automatically.
export async function activateSlot(order: SlotOrder): Promise<{ productId: string } | null> {
  if (order.product_id) return { productId: order.product_id };
  const supabase = getSupabaseAdmin();

  const info = await fetchSiteInfo(order.url);
  const domain = safeDomain(order.url);

  const rawUrl = order.url.trim();
  const isHandle = rawUrl.startsWith("@");
  const handle = isHandle ? rawUrl : `@${domain.split(".")[0]}`;
  const baseSlug =
    rawUrl
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "new-product";
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  const category = (CATEGORIES as readonly string[]).includes(order.category)
    ? order.category
    : "Other";

  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      name: info.title,
      tagline: info.tagline,
      description: info.description || `Claimed a slot on openoutbid.com`,
      url: rawUrl,
      domain,
      handle,
      logo: info.logoUrl,
      logo_bg: "#3b82f6",
      category,
      current_bid: order.bid_usd,
      clicks: 0,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) {
    console.error("activateSlot insert error", error.message);
    return null;
  }

  await supabase
    .from("slot_orders")
    .update({ product_id: data.id })
    .eq("id", order.id);

  return { productId: data.id };
}

export async function markOrderPaid(order: SlotOrder, txId?: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("slot_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      ...(txId ? { sepay_transaction_id: txId } : {}),
    })
    .eq("id", order.id)
    .eq("status", "pending"); // optimistic lock
}

// ── Site info scraper: real name + logo, no demo data ────────────────────────
async function fetchSiteInfo(rawUrl: string): Promise<{ title: string; tagline: string; description: string; logoUrl: string }> {
  const domain = safeDomain(rawUrl);
  const fallback = { title: domain, tagline: "Just claimed a slot — check it out!", description: "", logoUrl: faviconUrl(domain) };
  if (rawUrl.startsWith("@") || !/^https?:\/\//i.test(rawUrl) && !rawUrl.includes(".")) return fallback;

  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; openoutbid-bot/1.0)" },
      redirect: "follow",
    });
    const html = (await res.text()).slice(0, 60_000);

    const ogTitle = metaContent(html, "og:title");
    const title = (ogTitle || tagContent(html, "title") || domain).trim().slice(0, 80);
    const ogDesc = metaContent(html, "og:description") || metaContent(html, "description") || "";
    const description = ogDesc.trim().slice(0, 300);
    const tagline = description ? description.slice(0, 120) : `Just claimed a slot — check it out!`;

    // Prefer the site's own og:image / apple-touch-icon, fall back to Google favicon
    const ogImage = metaContent(html, "og:image");
    const logoUrl = ogImage && /^https?:\/\//.test(ogImage) ? ogImage : faviconUrl(domain);

    return { title: title || domain, tagline, description, logoUrl };
  } catch {
    return fallback;
  }
}

function metaContent(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const m = html.match(re);
  return decodeEntities(m?.[1] || m?.[2] || "");
}

function tagContent(html: string, tag: string): string {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return decodeEntities(m?.[1] || "");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function safeDomain(rawUrl: string): string {
  try {
    const url = rawUrl.startsWith("@")
      ? `https://x.com/${rawUrl.slice(1)}`
      : rawUrl.startsWith("http")
        ? rawUrl
        : `https://${rawUrl}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl.replace(/^https?:\/\//, "").split("/")[0] || rawUrl;
  }
}

export function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

// ── Polar ────────────────────────────────────────────────────────────────────
export function polarEnabled(): boolean {
  return Boolean(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_PRODUCT_ID);
}

// Create a Polar checkout session for the exact bid amount (in USD cents).
export async function createPolarCheckout(opts: {
  bidUsd: number;
  orderCode: string;
  customerEmail?: string;
}): Promise<{ checkoutId: string; url: string }> {
  const token = process.env.POLAR_ACCESS_TOKEN;
  const productId = process.env.POLAR_PRODUCT_ID;
  if (!token || !productId) throw new Error("Polar not configured yet");

  const res = await fetch("https://api.polar.sh/v1/checkouts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      amount: Math.round(opts.bidUsd * 100),
      currency: "usd",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://openoutbid.com"}/?paid=${opts.orderCode}`,
      customer_email: opts.customerEmail || undefined,
      metadata: { order_code: opts.orderCode },
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Polar ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return { checkoutId: data.id, url: data.url };
}

// Re-check a Polar checkout's status; returns true when it's confirmed paid.
export async function polarCheckoutPaid(checkoutId: string): Promise<boolean> {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(`https://api.polar.sh/v1/checkouts/${checkoutId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "confirmed" || data.status === "succeeded";
  } catch {
    return false;
  }
}
