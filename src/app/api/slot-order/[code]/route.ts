import { NextRequest, NextResponse } from "next/server";
import { getOrder, isExpired, activateSlot, markOrderPaid, polarCheckoutPaid } from "@/lib/payment";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const orderCode = decodeURIComponent(code).trim().toUpperCase();
  if (!orderCode) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const order = await getOrder(orderCode);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Polar: live re-check checkout status on each poll
  if (order.method === "polar" && order.status === "pending" && order.polar_checkout_id) {
    try {
      const paid = await polarCheckoutPaid(order.polar_checkout_id);
      if (paid) {
        await markOrderPaid(order);
        const updated = await getOrder(orderCode);
        if (updated) {
          const res = await activateSlot(updated);
          return NextResponse.json({ status: "paid", orderCode, productId: res?.productId || null });
        }
      }
    } catch {
      // keep polling
    }
  }

  if (order.status === "paid") {
    // Ensure product exists (in case webhook already marked paid but no product yet)
    let productId = order.product_id;
    if (!productId) {
      const res = await activateSlot(order);
      productId = res?.productId || null;
    }
    return NextResponse.json({ status: "paid", orderCode, productId });
  }

  if (isExpired(order)) {
    // Lazy mark expired in DB (best-effort, no need to block response)
    const supabase = getSupabaseAdmin();
    supabase.from("slot_orders").update({ status: "expired" }).eq("id", order.id).eq("status", "pending").then(() => {});
    return NextResponse.json({ status: "expired", orderCode });
  }

  return NextResponse.json({
    status: order.status,
    orderCode,
    amountVnd: order.amount_vnd,
    bidUsd: order.bid_usd,
  });
}
