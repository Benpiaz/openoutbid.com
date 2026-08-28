import type { Product, Category } from "./data";
import { supabase } from "./supabase";

// Map Supabase row (snake_case) -> Product (camelCase)
export function mapRowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    tagline: row.tagline as string,
    description: (row.description as string) || "",
    url: row.url as string,
    domain: row.domain as string,
    handle: row.handle as string,
    logo: row.logo as string,
    logoBg: (row.logo_bg as string) || "#1a1a1a",
    category: row.category as Category,
    currentBid: row.current_bid as number,
    clicks: row.clicks as number,
    createdAt: row.created_at as string,
  };
}

export function mapProductToRow(p: Partial<Product>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.name !== undefined) row.name = p.name;
  if (p.tagline !== undefined) row.tagline = p.tagline;
  if (p.description !== undefined) row.description = p.description;
  if (p.url !== undefined) row.url = p.url;
  if (p.domain !== undefined) row.domain = p.domain;
  if (p.handle !== undefined) row.handle = p.handle;
  if (p.logo !== undefined) row.logo = p.logo;
  if (p.logoBg !== undefined) row.logo_bg = p.logoBg;
  if (p.category !== undefined) row.category = p.category;
  if (p.currentBid !== undefined) row.current_bid = p.currentBid;
  if (p.clicks !== undefined) row.clicks = p.clicks;
  if (p.createdAt !== undefined) row.created_at = p.createdAt;
  return row;
}

// --- Server-side fetch helpers (use in async server components) ---

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("current_bid", { ascending: false });
  if (error) {
    console.error("getAllProducts:", error);
    return [];
  }
  return (data ?? []).map(mapRowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("getProductBySlug:", error);
    return null;
  }
  return data ? mapRowToProduct(data) : null;
}

export async function getProductsForToday(): Promise<Product[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .gte("created_at", today)
    .order("current_bid", { ascending: false });
  if (error) {
    console.error("getProductsForToday:", error);
    return [];
  }
  return (data ?? []).map(mapRowToProduct);
}
