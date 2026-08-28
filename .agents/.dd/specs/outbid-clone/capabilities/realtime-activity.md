# Purpose
Tăng FOMO và social proof bằng counter realtime giả và feed hoạt động mới nhất.

## ADDED Requirements

### Requirement: Online / visitor counter
Hiển thị số người online và tổng visitors ở header.

#### Scenario: Hiển thị counter
- **WHEN** homepage load
- **THEN** hiển thị "● 197 online · 1,411,129 visitors · see stats →" với số online dao động nhẹ (fake, random 150-250), visitors tăng chậm theo thời gian.

### Requirement: Latest activity feed
Hiển thị hoạt động claim/bid mới nhất.

#### Scenario: Hiển thị latest activity
- **WHEN** homepage render
- **THEN** section "Latest activity" hiển thị 4-6 items gần nhất: avatar/handle, product, giá bid, thời gian.

#### Scenario: Không có activity
- **WHEN** chưa có bid nào
- **THEN** hiển thị placeholder "No activity yet".
