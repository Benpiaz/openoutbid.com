"use client";

import { useEffect, useState } from "react";

type ApiOk = { live: true; online: number; visitors: number };
type ApiOff = { live: false };
type ApiRes = ApiOk | ApiOff;

export type LiveStatsState = {
  live: boolean;
  online: number;
  visitors: number;
};

const POLL_MS = 30_000;

export function useLiveStats(): LiveStatsState {
  const [state, setState] = useState<LiveStatsState>({
    live: false,
    online: 0,
    visitors: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const json = (await res.json()) as ApiRes;
        if (cancelled) return;
        if (json.live) {
          setState({ live: true, online: json.online, visitors: json.visitors });
        } else {
          setState({ live: false, online: 0, visitors: 0 });
        }
      } catch {
        if (cancelled) return;
        setState({ live: false, online: 0, visitors: 0 });
      }
    }

    poll();
    const pollId = setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, []);

  return state;
}
