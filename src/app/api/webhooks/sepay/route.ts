import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder, markOrderPaid, activateSlot } from "@/lib/payment";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const secret = (process.env.SEPAY_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    console.error("[SePay webhook] SEPAY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("x-sepay-signature") || "";
  const timestamp = req.headers.get("x-sepay-timestamp") || "";
  if (!signature || !timestamp) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  // Next 16: raw body via req.text() — use it for HMAC before parsing
  const raw = await req.text();
  const toSign = `${timestamp}.${raw}`;
  const expectedSig = "sha256=" + crypto.createHmac("sha256", secret).update(toSign).digest("hex");

  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.warn("[SePay webhook] signature mismatch");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Ignore outgoing
  if (event.transferType === "out") return NextResponse.json({ ok: true });
  if (event.transferType !== "in") return NextResponse.json({ ok: true });

  const content = String(event.content || event.description || "");
  const transferAmount = Number(event.transferAmount || event.amount || 0);
  const transactionId = String(event.id || event.transactionId || "");

  // Our order codes are OBB + digits (see lib/payment.ts)
  const m = content.match(/OBB(\d+)/i);
  if (!m) {
    console.log("[SePay webhook] no OBB code in content:", content.slice(0, 120));
    return NextResponse.json({ ok: true });
  }
  const orderCode = "OBB" + m[1].padStart(5, "0");

  // Dedup by transaction id
  if (transactionId) {
    const supabase = getSupabaseAdmin();
    const { data: dup } = await supabase
      .from("slot_orders")
      .select("id")
      .eq("sepay_transaction_id", transactionId)
      .maybeSingle();
    if (dup) return NextResponse.json({ ok: true, note: "duplicate" });
  }

  const order = await getOrder(orderCode);
  if (!order || order.status !== "pending") {
    console.log(`[SePay webhook] no pending order for ${orderCode}`);
    return NextResponse.json({ ok: true });
  }

  if (transferAmount !== order.amount_vnd) {
    console.warn(`[SePay webhook] amount mismatch ${orderCode}: expected ${order.amount_vnd}, got ${transferAmount}`);
    return NextResponse.json({ ok: true });
  }

  await markOrderPaid(order, transactionId || undefined);
  // Refresh to get the paid row before activating
  const paidOrder = await getOrder(orderCode);
  if (paidOrder) await activateSlot(paidOrder);

  console.log(`[SePay webhook] paid ${orderCode} (${order.bid_usd}$)`);
  return NextResponse.json({ ok: true });
}
