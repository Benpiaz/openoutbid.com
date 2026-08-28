# Purpose
Hiển thị bảng xếp hạng sản phẩm theo giá bid, hỗ trợ all-time và today, daily top 3, và trạng thái "see details".

## ADDED Requirements

### Requirement: Xếp hạng theo bid giảm dần
Hệ thống sắp xếp products theo `currentBid` giảm dần, gán rank #1, #2, #3...

#### Scenario: Hiển thị leaderboard all-time
- **WHEN** người dùng vào homepage (tab All-time)
- **THEN** danh sách hiển thị products sắp xếp theo bid cao -> thấp, mỗi card hiện rank, logo, tên, tagline, category, "x days ago", domain, clicks, giá bid.

#### Scenario: Không có sản phẩm
- **WHEN** chưa có product nào
- **THEN** hiển thị empty state "No products yet - be the first to claim #1".

### Requirement: Toggle All-time vs Today
Chuyển đổi giữa leaderboard all-time và today (products có bid trong ngày).

#### Scenario: Chuyển sang Today
- **WHEN** người dùng bấm tab "Today"
- **THEN** chỉ hiển thị products có bid/claim trong ngày hiện tại (theo server date), sắp xếp theo bid.

### Requirement: Today's top ranking (top 3 daily)
Hiển thị 3 sản phẩm top của ngày ở section riêng.

#### Scenario: Hiển thị daily top 3
- **WHEN** homepage render
- **THEN** section "Today's top ranking" hiển thị tối đa 3 cards nhỏ (#1 #2 #3) với giá daily.

### Requirement: Product detail
Xem chi tiết sản phẩm.

#### Scenario: Click see details
- **WHEN** người dùng bấm "see details" hoặc click card
- **THEN** điều hướng tới `/p/[slug]` hiển thị thông tin đầy đủ, lịch sử bid, clicks.
