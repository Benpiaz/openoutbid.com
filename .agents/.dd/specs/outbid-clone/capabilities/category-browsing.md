# Purpose
Duyệt sản phẩm theo category, trang categories, daily, leaderboard tổng hợp.

## ADDED Requirements

### Requirement: Filter category pills trên homepage
Lọc leaderboard theo category đã chọn.

#### Scenario: Chọn category
- **WHEN** người dùng bấm pill "Agents"
- **THEN** leaderboard chỉ hiển thị products có category = Agents, pill chuyển active (màu cam), URL thêm `?cat=agents`.

#### Scenario: Chọn All
- **WHEN** người dùng bấm "All"
- **THEN** hiển thị tất cả products, bỏ filter category.

#### Scenario: Explore mở rộng
- **WHEN** người dùng bấm "Explore >"
- **THEN** điều hướng tới `/categories` hiển thị tất cả categories.

### Requirement: Trang Categories / Daily / Leaderboard
Các trang riêng cho từng view.

#### Scenario: Truy cập /categories
- **WHEN** vào `/categories`
- **THEN** hiển thị grid các category với số products và top bid từng category.

#### Scenario: Truy cập /daily
- **WHEN** vào `/daily`
- **THEN** hiển thị ranking của ngày hiện tại, có date picker (MVP chỉ today).

#### Scenario: Truy cập /leaderboard
- **WHEN** vào `/leaderboard`
- **THEN** hiển thị full leaderboard all-time có phân trang (MVP 50 items).
