import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/data";
import { createSlotOrder, SEPAY_BANK_ACCOUNT, SEPAY_BANK_NAME, SEPAY_ACCOUNT_NAME, SEPAY_QR_BASE, polarEnabled, createPolarCheckout } from "@/lib/payment";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl: string = String(body.url ?? "").trim();
    const category: string = String(body.category ?? "").trim();
    const bid: number = Number(body.bid);
    const method: string = String(body.method ?? "sepay").trim() as "sepay" | "polar";

    if (!rawUrl) return NextResponse.json({ error: "Missing URL or @handle" }, { status: 400 });
    if (!(CATEGORIES as readonly string[]).includes(category))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    if (!Number.isFinite(bid) || bid < 1) return NextResponse.json({ error: "Invalid bid" }, { status: 400 });
    const bidUsd = Math.floor(bid);
    if (method !== "sepay" && method !== "polar") {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: top } = await supabase.from("products").select("current_bid").order("current_bid", { ascending: false }).limit(1).maybeSingle();
    const maxBid = Number(top?.current_bid || 0);
    if (bidUsd > 0 && bidUsd <= maxBid && bidUsd < maxBid * 5) {
      // Soft constraint: warn that they won't be #1 — but still allow (they'll just rank lower).
    }

    const order = await createSlotOrder({ url: rawUrl, category, bidUsd, method });

    if (method === "polar") {
      if (!polarEnabled()) {
        return NextResponse.json({
          orderCode: order.order_code,
          amountVnd: order.amount_vnd,
          bidUsd: order.bid_usd,
          method: "polar",
          polarNotReady: true,
          message: "Polar chưa được kết nối — sẽ kích hoạt khi Ben gửi token.",
        });
      }
      const { checkoutId, url: checkoutUrl } = await createPolarCheckout({
        bidUsd,
        orderCode: order.order_code,
        customerEmail: typeof body.email === "string" ? body.email : undefined,
      });
      await supabase.from("slot_orders").update({ polar_checkout_id: checkoutId }).eq("id", order.id);
      return NextResponse.json({
        orderCode: order.order_code,
        amountVnd: order.amount_vnd,
        bidUsd: order.bid_usd,
        method: "polar",
        checkoutUrl,
      });
    }

    // sepay: return VietQR details
    const qrUrl = `${SEPAY_QR_BASE}?bank=${SEPAY_BANK_NAME}&acc=${SEPAY_BANK_ACCOUNT}&template=compact&amount=${order.amount_vnd}&des=${order.order_code}`;
    return NextResponse.json({
      orderCode: order.order_code,
      amountVnd: order.amount_vnd,
      bidUsd: order.bid_usd,
      method: "sepay",
      qrUrl,
      bankAccount: SEPAY_BANK_ACCOUNT,
      bankName: SEPAY_BANK_NAME,
      accountName: SEPAY_ACCOUNT_NAME,
    });
  } catch (e: unknown) {
    console.error("create order error", e);
    return NextResponse.json({ error: (e as Error).message || "Unexpected error" }, { status: 500 });
  }
}
