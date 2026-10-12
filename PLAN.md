# Kế hoạch làm project Flash-Mart API

## Các entity cần có
- users
- products
- campaign_item
- campaign
- orders
## Chi tiết các tính năng
### Đăng kí
- endpoint: POST /api/v1/auth/register
- repository: findByEmail, save 
- service: register, tìm user bằng email nếu có thì báo lỗi , không thì lưu vào db