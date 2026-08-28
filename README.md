# Outbid

**Claim #1 for your product.** A real-time bidding leaderboard where your bid decides your rank. No ads, no API keys, no revenue sharing — just outbid the competition to the top.

Clone of [outbid.lol](https://outbid.lol) — Next.js 16 + Supabase. Live site: `openoutbid.com`.

## Tech

- [Next.js 16.3.3](https://nextjs.org) (App Router, Turbopack) + React 19, TypeScript
- [Supabase](https://supabase.com) (Postgres + `@supabase/supabase-js`)
- [Tailwind CSS v4](https://tailwindcss.com) + [lucide-react](https://lucide.com)
- Deployed on [Vercel](https://vercel.com)

## Features

- Live leaderboard ranked by bid (all-time + last 24h)
- Category board + pills (`/categories`)
- Claim flow (`POST /api/claim` writes a product to Supabase)
- Daily leaderboard (`/daily`), stats (`/stats`), about (`/about`), product detail (`/p/[slug]`)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Create `.env.local` at the repo root (these values are secret — never commit them):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

The `products` table must exist with the snake_case columns expected by `src/lib/db.ts` (`slug`, `tagline`, `current_bid`, `logo_bg`, `created_at`, …).

### 3. Run

```bash
npm run dev    # http://localhost:3000
npm run build
npm start
```

## Structure

```
src/
  app/            # App Router: /, /daily, /stats, /categories, /p/[slug], /api/claim
  components/     # leaderboard-row, navbar, footer, category-pills, view-mode, …
  lib/            # data.ts / db.ts (row mapping), category-icons.tsx, supabase client
```

## Roadmap

- [ ] Stripe Checkout + webhook
- [ ] Auth / admin dashboard
