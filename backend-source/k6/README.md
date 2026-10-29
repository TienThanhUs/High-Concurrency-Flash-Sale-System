# Hướng dẫn chạy Load Test với Grafana k6 cho FlashMart-API

Thư mục `k6/` chứa 2 kịch bản kiểm thử chịu tải qua HTTP thực tế cho hệ thống **FlashMart-API**:

1. **[`oversell-test.js`](./oversell-test.js):** Giả lập **300 người dùng khác nhau** đồng loạt bấm mua **1 mặt hàng chỉ có tồn kho = 100**. Kiểm chứng đúng `100` đơn nhận `202 Accepted` và `200` request bị chặn `409 Conflict (ORD-001)`.
2. **[`duplicate-test.js`](./duplicate-test.js):** Giả lập **1 người dùng duy nhất** dùng tool bắn đồng loạt **50 HTTP requests** vào cùng 1 mặt hàng. Kiểm chứng đúng `1` đơn nhận `202 Accepted` và `49` request bị chặn `409 Conflict (ORD-002)`.

---

## Bước 1: Khởi động hệ thống FlashMart-API

Tạo file `.env` từ `.env.example` và đặt mật khẩu cho tài khoản Admin khởi tạo tự động (`AdminSeeder`):

```bash
cp .env.example .env
# Đảm bảo trong .env có dòng: ADMIN_PASSWORD=Admin@123456
docker compose up -d --build
```

Đợi vài giây cho đến khi kiểm tra sức khỏe báo `UP`:
```bash
curl http://localhost:8080/actuator/health
```

---

## Bước 2: Chạy k6

### Cách A: Nếu máy bạn đã cài `k6` (`brew install k6`)
```bash
# 1. Test chống bán lố (300 users tranh 100 sản phẩm):
k6 run k6/oversell-test.js

# 2. Test chống mua trùng (1 user bắn 50 requests cùng lúc):
k6 run k6/duplicate-test.js
```

### Cách B: Chạy bằng Docker (Không cần cài k6 lên máy!)
```bash
# 1. Test chống bán lố:
docker run --rm -i --network host -e BASE_URL=http://localhost:8080 grafana/k6 run - < k6/oversell-test.js

# 2. Test chống mua trùng:
docker run --rm -i --network host -e BASE_URL=http://localhost:8080 grafana/k6 run - < k6/duplicate-test.js
```
*(Lưu ý trên macOS Docker Desktop: dùng `-e BASE_URL=http://host.docker.internal:8080` khi chạy qua container `grafana/k6`).*
