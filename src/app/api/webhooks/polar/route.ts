import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder, markOrderPaid, activateSlot } from "@/lib/payment";

const POLAR_WEBHOOK_SECRET = (process.env.POLAR_WEBHOOK_SECRET || "").trim();
const SKEW_MS = 5 * 60 * 1000;

function decodePolarSecret(raw: string): Buffer | null {
  if (!raw) return null;
  const value = raw.startsWith("whsec_") ? raw.slice(6) : raw;
  try {
    const decoded = Buffer.from(value, "base64");
    if (decoded.length > 0 && decoded.toString("base64").replace(/=+$/, "") === value.replace(/=+$/, "")) return decoded;
  } catch {}
  return Buffer.from(value, "utf8");
}
const SECRET_BUF = decodePolarSecret(POLAR_WEBHOOK_SECRET);
const seen = new Map<string, number>();
setInterval(() => {
  const cutoff = Date.now() - SKEW_MS * 2;
  for (const [k, ts] of seen) if (ts < cutoff) seen.delete(k);
}, 60000);

function verifyPolar(req: NextRequest, raw: Buffer): { ok: true } | { ok: false; reason: string } {
  if (!SECRET_BUF) return { ok: false, reason: "not_configured" };
  const id = req.headers.get("webhook-id");
  const timestamp = req.headers.get("webhook-timestamp");
  const sigHeader = req.headers.get("webhook-signature");
  if (!id || !timestamp || !sigHeader) return { ok: false, reason: "missing_headers" };
  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() - tsNum * 1000) > SKEW_MS) return { ok: false, reason: "timestamp_skew" };
  const toSign = Buffer.concat([Buffer.from(`${id}.${timestamp}.`, "utf8"), raw]);
  const expected = crypto.createHmac("sha256", SECRET_BUF).update(toSign).digest();
  for (const part of sigHeader.split(" ")) {
    const [version, b64sig] = part.split(",");
    if (version !== "v1" || !b64sig) continue;
    try {
      const provided = Buffer.from(b64sig, "base64");
      if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected)) return { ok: true };
    } catch {}
  }
  return { ok: false, reason: "bad_signature" };
}

export async function POST(req: NextRequest) {
  if (!SECRET_BUF) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const raw = Buffer.from(await req.arrayBuffer());

  const verify = verifyPolar(req, raw);
  if (!verify.ok) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  const webhookId = req.headers.get("webhook-id")!;
  if (seen.has(webhookId)) return NextResponse.json({ ok: true, note: "duplicate" });
  seen.set(webhookId, Date.now());

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // We only care about checkout success — map it to our slot order via metadata.order_code
  const type = String(event.type || "");
  // Polar emits order.created / order.updated; older docs use checkout.updated
  if (!type.startsWith("order.") && !type.startsWith("checkout.")) {
    return NextResponse.json({ ok: true });
  }

  const data = event.data as Record<string, unknown>;
  const status = String((data as Record<string, unknown>)?.status || "");
  if (status !== "paid" && status !== "confirmed" && status !== "succeeded") {
    return NextResponse.json({ ok: true });
  }

  const orderCode =
    String((data as Record<string, unknown>)?.metadata && ((data as Record<string, unknown>).metadata as Record<string, unknown>)?.order_code || "") ||
    "";

  if (!orderCode) {
    console.log("[Polar webhook] no order_code in metadata/checkout", type);
    return NextResponse.json({ ok: true });
  }

  const order = await getOrder(orderCode);
  if (!order || order.status !== "pending") {
    console.log(`[Polar webhook] no pending order for ${orderCode}`);
    return NextResponse.json({ ok: true });
  }

  await markOrderPaid(order);
  const paid = await getOrder(orderCode);
  if (paid) await activateSlot(paid);

  console.log(`[Polar webhook] paid ${orderCode} (${order.bid_usd}$)`);
  return NextResponse.json({ ok: true });
}
