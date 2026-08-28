# Purpose
Cho phép người dùng claim vị trí xếp hạng bằng cách nhập URL/handle + chọn category, trả tiền để chiếm rank.

## ADDED Requirements

### Requirement: Form claim rank
Form gồm input URL/handle, dropdown category, nút Claim rank.

#### Scenario: Submit hợp lệ
- **WHEN** người dùng nhập URL hoặc @handle hợp lệ + chọn category + bấm Claim rank
- **THEN** hệ thống tính giá claim = (current top bid + $1), tối thiểu $5, hiển thị confirm/checkout.

#### Scenario: Input rỗng hoặc sai format
- **WHEN** submit với URL/handle rỗng hoặc không hợp lệ
- **THEN** hiển thị lỗi inline, không tạo bid.

### Requirement: Tính giá claim
Giá để chiếm #1 luôn là top bid hiện tại + $1 (hoặc + increment config).

#### Scenario: Tính giá #1
- **WHEN** top bid hiện tại là $17,000
- **THEN** hero hiển thị "Claim #1 for $17,005" (ví dụ +$5) và giá claim cho user là $17,001 (configurable). MVP dùng +$1.

### Requirement: Thanh toán (Stripe test mode MVP)
Tích hợp Stripe Checkout; sau khi thanh toán thành công webhook cập nhật rank.

#### Scenario: Thanh toán thành công
- **WHEN** user hoàn tất Stripe Checkout và webhook verified
- **THEN** tạo product (nếu chưa có) + tạo bid record + cập nhật currentBid + reorder leaderboard.

#### Scenario: Thanh toán fake (dev fallback)
- **WHEN** Stripe keys chưa cấu hình
- **THEN** nút Claim rank hoạt động ở fake mode: tạo bid ngay không cần checkout, hiển thị badge "TEST MODE".

### Requirement: Outbid - đẩy rank cũ
Khi có bid cao hơn, rank cũ bị đẩy xuống.

#### Scenario: Outbid
- **WHEN** product B bid $18,000 trong khi #1 hiện tại là $17,000
- **THEN** B lên #1, product cũ xuống #2, các rank khác dịch xuống tương ứng.
