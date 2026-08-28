"use client";

const TESTIMONIALS = [
  {
    handle: "@MakerThrive",
    name: "MakerThrive",
    text: "This is genius. Pay-to-rank leaderboard is the most honest monetization I've seen.",
    likes: "2.4k",
  },
  {
    handle: "@Lewis",
    name: "Lewis",
    text: "outbid.lol is printing money. $238k since launch with zero ad spend. Wild.",
    likes: "1.8k",
  },
  {
    handle: "@CrowdReply",
    name: "CrowdReply",
    text: "We claimed #3 and got 400 clicks in 2 hours. Worth every dollar.",
    likes: "892",
  },
  {
    handle: "@Tibo",
    name: "Tibo",
    text: "The leaderboard takeover feature is brilliant — own page 1 for 3 hours straight.",
    likes: "1.1k",
  },
] as const;

export default function Testimonials() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TESTIMONIALS.map((t) => (
        <div key={t.handle} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {(t.name.charAt(0) || "?").toUpperCase()}
            </span>
            <span className="text-sm font-semibold">{t.name}</span>
            <span className="text-xs text-muted-foreground">{t.handle}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
          <p className="mt-2 text-xs text-muted-foreground/60">♡ {t.likes} likes</p>
        </div>
      ))}
    </div>
  );
}
