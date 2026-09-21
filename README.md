# FlashMart-API

FlashMart-API là hệ thống Backend cung cấp RESTful API cho nghiệp vụ Flash Sale (Bán hàng chớp nhoáng). Dự án được thiết kế để giải quyết bài toán chịu tải cao (High Concurrency) và ngăn chặn tình trạng bán vượt quá số lượng (Over-selling) bằng kiến trúc Event-Driven.

## Các tính năng nghiệp vụ (Business Features)
- **User Management:** Xác thực và định danh người dùng (Đăng ký, Đăng nhập bảo mật).
- **Campaign Management:** Cung cấp API tạo Deal/Chiến dịch Flash Sale (thiết lập thời gian mở bán, số lượng sản phẩm giới hạn).
- **Order Management:** Cung cấp API đặt hàng trong thời gian diễn ra Flash Sale.

## Điểm nhấn hệ thống (System Architecture & Flow)
Thay vì ghi trực tiếp vào Database gây nghẽn thắt cổ chai, luồng đặt hàng được thiết kế tối ưu như sau:
1. Xác thực người dùng qua JWT.
2. Khi có request đặt hàng, hệ thống kiểm tra và trừ tồn kho trực tiếp trên bộ nhớ đệm Redis (đảm bảo tốc độ cao và ngăn chặn Over-selling).
3. Nếu trừ tồn kho thành công, hệ thống không ghi DB ngay mà đẩy một Order Event (Sự kiện đặt hàng) vào Kafka Topic.
4. Kafka Consumer chạy ngầm sẽ lấy các event này ra, xử lý logic tuần tự và tiến hành ghi dữ liệu xuống PostgreSQL.

## Công nghệ sử dụng (Tech Stack)
- **Core Backend:** Java & Spring Boot
- **Database:** PostgreSQL
- **Caching & Locking:** Redis
- **Message Broker:** Apache Kafka
- **Security:** JWT (JSON Web Token)
- **Infrastructure & DevOps:** Docker, Docker Compose
- **Database Migration:** Flyway

## Hướng dẫn cài đặt và chạy (Getting Started)

### Yêu cầu hệ thống
- Máy tính đã cài đặt [Docker](https://www.docker.com/) và Docker Compose.

### Khởi chạy dự án
Dự án đã được đóng gói toàn bộ hạ tầng (PostgreSQL, Redis, Kafka, Zookeeper) vào Docker.

1. Clone repository về máy:
   ```bash
   git clone [https://github.com/your-username/FlashMart-API.git](https://github.com/your-username/FlashMart-API.git)
   cd FlashMart-API](https://github.com/TienThanhUs/High-Concurrency-Flash-Sale-System.git)