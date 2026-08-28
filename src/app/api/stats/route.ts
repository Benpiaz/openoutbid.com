import { NextResponse } from "next/server";

const DATAFAST_API = "https://datafa.st/api/v1/analytics";
const CACHE_MS = 30_000;

type LiveStats = { live: true; online: number; visitors: number };
type SimStats = { live: false };

let cache: { at: number; body: LiveStats } | null = null;

export async function GET() {
  const key = process.env.DATAFAST_API_KEY;
  const websiteId = process.env.DATAFAST_WEBSITE_ID;
  if (!key) return NextResponse.json({ live: false } satisfies SimStats);

  if (cache && Date.now() - cache.at < CACHE_MS) return NextResponse.json(cache.body);

  try {
    const auth = { Authorization: `Bearer ${key}` };
    // dft_ (Access Token) requires websiteId on every analytics call;
    // df_ (Website Key) infers the site and must NOT send websiteId.
    const widParam = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
    const widAmp = websiteId ? `&websiteId=${encodeURIComponent(websiteId)}` : "";
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const [rtRes, ovRes] = await Promise.all([
      fetch(`${DATAFAST_API}/realtime${widParam}`, { headers: auth, cache: "no-store" }),
      fetch(`${DATAFAST_API}/overview?fields=visitors&startAt=${yesterday}&endAt=${today}${widAmp}`, {
        headers: auth,
        cache: "no-store",
      }),
    ]);
    if (!rtRes.ok || !ovRes.ok) {
      const rtText = await rtRes.text().catch(() => "");
      const ovText = await ovRes.text().catch(() => "");
      console.warn("datafa.st stats non-ok", rtRes.status, rtText.slice(0, 300), ovRes.status, ovText.slice(0, 300));
      return NextResponse.json({ live: false } satisfies SimStats);
    }

    const rt = (await rtRes.json()) as { data?: Array<{ visitors?: number }> };
    const ov = (await ovRes.json()) as { data?: Array<{ visitors?: number }> };

    const body: LiveStats = {
      live: true,
      online: rt.data?.[0]?.visitors ?? 0,
      visitors: ov.data?.[0]?.visitors ?? 0,
    };
    cache = { at: Date.now(), body };
    return NextResponse.json(body);
  } catch (e) {
    console.error("datafa.st stats fetch failed", e);
    return NextResponse.json({ live: false } satisfies SimStats);
  }
}
