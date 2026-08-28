# Proposal: Outbid Clone - outbid.com

## Why

outbid.lol chứng minh mô hình "pay-to-rank" hoạt động: bán vị trí #1 thay vì bán ads. 1.4M visitors, top bid $17k, người dùng trả tiền để được visibility. Ben muốn clone mô hình này tại outbid.com để test thị trường VN/global với chi phí thấp, deploy nhanh trên Vercel, thu tiền qua Stripe.

Problem hiện tại: chưa có sản phẩm. Cần MVP trong 1-2 ngày, giống 95% UI/UX gốc để validate nhu cầu trước khi thêm twist riêng.

## What Changes

Tạo mới dự án Next.js 16.3.1 + React + Turbopack + Tailwind CSS + Base UI + Lucide tại `outbid.com/`.

- Homepage với hero "Claim #1 for $X", form claim (URL/handle + category), filter category pills, leaderboard list (rank cards), Today's top ranking, Latest activity
- Ranking/bidding engine: giá #1 = max bid + increment $1, lịch sử bid, Stripe Checkout (test mode) + webhook, outbid logic
- Product detail page `/p/[slug]` và category/daily/leaderboard pages
- Fake realtime: online counter, visitor counter, latest activity feed
- Admin page `/admin` quản lý products/bids
- Seed data giống ảnh gốc để demo ngay

## Capabilities

### New Capabilities
- `capabilities/ranking-leaderboard`: Hiển thị xếp hạng, sort theo bid, all-time vs today, daily top 3
- `capabilities/bid-claim`: Claim rank flow: input URL/category -> tính giá -> checkout -> confirm -> cập nhật rank
- `capabilities/category-browsing`: Filter theo category, trang categories, daily, leaderboard
- `capabilities/realtime-activity`: Visitor/online counter, latest activity feed

### Modified Capabilities
- (none - dự án mới)

## Impact

- Code: toàn bộ `outbid.com/` mới, không ảnh hưởng repo khác
- DB: Prisma + SQLite (dev) / Postgres (prod, Vercel Postgres/Neon)
- Dependencies: Next.js 16.3.1, Tailwind v4, @base-ui/react, lucide-react, Prisma, Stripe (optional test mode)
- Deploy: Vercel, env vars cho DB + Stripe
