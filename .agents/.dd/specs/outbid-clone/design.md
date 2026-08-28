# Design: Outbid Clone

## Context
Clone outbid.lol - pay-to-rank leaderboard. Stack đã chốt: Next.js 16.3.1 + Turbopack + Tailwind v4 + Base UI + Lucide + Vercel. DB Prisma SQLite dev / Postgres prod. Chưa có codebase (thư mục trống).

## Goals / Non-Goals
**Goals:**
- Pixel gần giống ảnh gốc (peach/pink theme, rounded cards, pill filters)
- MVP chạy được không cần Stripe keys (fake mode)
- Seed data để demo ngay, không cần nhập tay

**Non-Goals:**
- Auth đầy đủ, comment, upvote, search
- Realtime websocket thật (dùng fake counter + polling)
- Payment live (để V2)

## Decisions

| Decision | Choice | Why | Alternative |
|---|---|---|---|
| DB ORM | Prisma | Chuẩn Next.js, migrate dễ, SQLite dev | Drizzle |
| DB dev | SQLite | Zero setup, file-based | Postgres docker |
| DB prod | Neon/Vercel Postgres | Free tier, serverless | Supabase |
| Payment | Stripe Checkout + fake fallback | Nếu thiếu keys vẫn demo được | Chỉ fake |
| State | Server Components + URL searchParams | Đơn giản, SEO tốt | Zustand |
| Styling | Tailwind v4 + Base UI | Giữ đúng stack gốc | shadcn |
| Hosting | Vercel | Native Next.js | - |

## Data Model

```
Product { id, slug, name, tagline, description, url, domain, handle, logo, category, currentBid, clicks, createdAt }
Bid { id, productId, amount, bidderHandle, createdAt, status: pending|confirmed }
Category enum: Agents, SEO, Marketing, Crypto, Developer, Business, Security, Health
```

## Routes

- `/` - homepage (hero + claim form + filters + leaderboard + daily top 3 + latest activity)
- `/categories` - grid categories
- `/daily` - ranking today
- `/leaderboard` - full all-time
- `/p/[slug]` - product detail
- `/api/bids` - POST create bid
- `/api/checkout` - Stripe checkout session
- `/api/webhook` - Stripe webhook
- `/admin` - admin table

## Risks / Trade-offs
- Stripe webhook cần public URL -> dev dùng fake mode, prod mới test webhook
- Fake counter có thể gây hiểu lầm -> thêm badge "demo" nếu cần
- SQLite không chạy trên Vercel -> prod phải dùng Postgres, cần 2 datasource config
