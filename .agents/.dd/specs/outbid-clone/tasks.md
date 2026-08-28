# Tasks: Outbid Clone

## 1. Scaffold Next.js project

- [ ] 1.1 Khởi tạo Next.js 16.3.1 với TypeScript, Tailwind v4, Turbopack, ESLint
- [ ] 1.2 Cài Base UI (@base-ui/react) + lucide-react
- [ ] 1.3 Cấu hình layout gốc, font, theme colors (peach #FF6B4A / #FFF7F0), dark mode toggle

## 2. Data layer

- [ ] 2.1 Setup Prisma + SQLite (dev), schema Product/Bid
- [ ] 2.2 Seed data 8-10 products giống ảnh gốc (see.io, Tutti, JONI...)
- [ ] 2.3 API helpers: getLeaderboard, getDailyTop, getProductBySlug, getLatestActivity

## 3. Homepage UI

- [ ] 3.1 Header: logo outbid.lol + toggle All-time/Today + nav Leaderboard/Daily/Categories/About
- [ ] 3.2 Stats bar: online counter + visitors
- [ ] 3.3 Hero "Claim #1 for $X" với +/- buttons
- [ ] 3.4 Claim form: URL/handle input + category select + Claim rank button (Base UI Select)
- [ ] 3.5 Category pills filter (All, Agents, SEO...) + Explore
- [ ] 3.6 Leaderboard cards (#1 #2 #3 với màu peach highlight, còn lại trắng) - responsive
- [ ] 3.7 Today's top ranking (3 cards nhỏ)
- [ ] 3.8 Latest activity feed

## 4. Bidding flow

- [ ] 4.1 Claim form logic: validate, tính giá (top + $1), POST /api/bids
- [ ] 4.2 Fake mode: không cần Stripe vẫn tạo bid được
- [ ] 4.3 Stripe Checkout integration (nếu có keys) + webhook

## 5. Các trang phụ

- [ ] 5.1 `/p/[slug]` product detail
- [ ] 5.2 `/categories`, `/daily`, `/leaderboard` pages
- [ ] 5.3 `/admin` quản lý bids

## 6. Polish & deploy

- [ ] 6.1 Responsive + dark mode
- [ ] 6.2 Build check (npm run build) + fix lỗi
- [ ] 6.3 Hướng dẫn deploy Vercel
