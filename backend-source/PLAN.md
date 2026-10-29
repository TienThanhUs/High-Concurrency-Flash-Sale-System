# Kế hoạch & Trạng thái hoàn thiện FlashMart-API

## 1. Các bảng dữ liệu & Domain Entities
- `users` (`User`, `Role`: `USER`, `ADMIN`)
- `products` (`Product`)
- `campaigns` (`Campaign`, `CampaignStatus`: `UPCOMING`, `ACTIVE`, `ENDED`)
- `campaign_items` (`CampaignItem` - có `version` và CHECK `available_quantity >= 0`, `flash_sale_price > 0`)
- `orders` (`Order`, `OrderStatus`: `PENDING`, `CONFIRMED`, `CANCELLED` - có `UNIQUE(user_id, campaign_item_id)`)

## 2. Chi tiết các tính năng (ĐÃ HOÀN THÀNH 100%)

### Xác thực & Phân quyền (`/api/v1/auth`)
- **Đăng ký (`POST /api/v1/auth/register`)**:
  - Public, kiểm tra `@Valid`, kiểm tra trùng `email` (`AUTH-001` - 409) và `username` (`AUTH-002` - 409), mã hoá mật khẩu bằng BCrypt, trả về JWT.
- **Đăng nhập (`POST /api/v1/auth/login`)**:
  - Public, xác thực email & mật khẩu BCrypt, trả về JWT (sai thông tin -> `AUTH-401` - 401).
- **Seed ADMIN**:
  - Tự động tạo tài khoản `ADMIN` khi khởi động qua `AdminSeeder` nếu cấu hình biến môi trường `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### Quản lý Sản phẩm (`/api/v1/products`)
- **Danh sách sản phẩm có phân trang (`GET /api/v1/products?page=0&size=20`)**: Public.
- **Chi tiết sản phẩm (`GET /api/v1/products/{id}`)**: Public.
- **Tạo sản phẩm (`POST /api/v1/products`)**: Chỉ `ADMIN` (`@PreAuthorize("hasRole('ADMIN')")`), trả `201 Created` kèm header `Location`.
- **Xoá sản phẩm (`DELETE /api/v1/products/{id}`)**: Chỉ `ADMIN`, trả `204 No Content`.

### Quản lý Chiến dịch Flash Sale (`/api/v1/campaigns`)
- **Tạo chiến dịch (`POST /api/v1/campaigns`)**: Chỉ `ADMIN`, trạng thái khởi tạo `UPCOMING`.
- **Thêm sản phẩm vào chiến dịch (`POST /api/v1/campaigns/{campaignId}/items`)**: Chỉ `ADMIN`, khởi tạo `available_quantity = total_quantity`.
- **Đổi trạng thái chiến dịch (`PATCH /api/v1/campaigns/{campaignId}/status`)**: Chỉ `ADMIN`, chuyển `UPCOMING -> ACTIVE -> ENDED`. Khi chuyển sang `ACTIVE`, tự động **warm-up** tồn kho và tập người mua lên Redis.
- **Xem danh sách chiến dịch đang ACTIVE (`GET /api/v1/campaigns/active`)**: Public.
- **Đồng bộ lại tồn kho Redis từ DB (`POST /api/v1/campaigns/reconcile`)**: Chỉ `ADMIN` (ngoài ra tự động chạy khi ứng dụng khởi động qua `InventoryWarmUpRunner` hoặc khi phát hiện thiếu key Redis).

### Đặt hàng Flash Sale (`/api/v1/orders`)
- **Đặt hàng (`POST /api/v1/orders`)**:
  - Yêu cầu JWT (`userId` lấy từ `UserPrincipal`, không nhận từ body).
  - Kiểm tra chiến dịch `ACTIVE` và trong khung giờ `startTime..endTime`.
  - Thực thi **1 Lua script atomic trên Redis** kiểm tra tập người mua (`flashmart:buyers:{itemId}`) và trừ tồn kho (`flashmart:stock:{itemId}`).
  - Publish `OrderCreatedEvent` lên Kafka (key = `campaignItemId`) và trả `202 Accepted` (`PENDING`). Nếu publish Kafka lỗi, tự động chạy **compensation** hoàn lại tồn kho và xoá user khỏi SET trên Redis.
- **Kafka Consumer (`OrderCreatedKafkaConsumer`)**:
  - Xử lý bất đồng bộ, **idempotent**, trừ `available_quantity` bằng câu SQL có điều kiện (`WHERE id = :id AND available_quantity > 0`) và lưu đơn `CONFIRMED` trong cùng 1 transaction. Có retry hữu hạn (3 lần) và đẩy vào Dead-Letter Topic (`.dlt`) nếu lỗi hạ tầng kéo dài.
- **Đơn hàng của tôi (`GET /api/v1/orders/me`)**: Yêu cầu đăng nhập.
- **Chi tiết đơn hàng (`GET /api/v1/orders/{id}`)**: Chỉ chủ đơn hoặc `ADMIN`.
- **Huỷ đơn hàng (`POST /api/v1/orders/{id}/cancel`)**: Chỉ chủ đơn hoặc `ADMIN`, chuyển trạng thái sang `CANCELLED` và hoàn tồn kho trên cả PostgreSQL lẫn Redis.