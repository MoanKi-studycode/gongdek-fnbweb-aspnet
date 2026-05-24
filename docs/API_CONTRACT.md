# API Contract — GongDek (module Trần Anh Tín)

Base URL: `http://localhost:5256/api`

Header xác thực: `Authorization: Bearer {token}`

## Auth

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| POST | `/auth/login` | Public | Đăng nhập NV/KH |
| POST | `/auth/register-customer` | Public | Đăng ký khách hàng |
| GET | `/auth/me` | Đã đăng nhập | Thông tin user |
| POST | `/auth/logout` | Đã đăng nhập | Đăng xuất |

## Nhân viên (QuanLy)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/nhan-vien` | Danh sách |
| GET | `/nhan-vien/vai-tro` | Dropdown vai trò |
| GET | `/nhan-vien/{id}` | Chi tiết |
| POST | `/nhan-vien` | Tạo mới |
| PUT | `/nhan-vien/{id}` | Cập nhật |
| PUT | `/nhan-vien/{id}/khoa` | Khóa |
| PUT | `/nhan-vien/{id}/mo-khoa` | Mở khóa |

## Ca làm việc (QuanLy)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/khung-ca` | Khung ca |
| GET | `/ca-lam-viec` | Lịch sử ca |
| GET | `/ca-lam-viec/dang-mo` | Ca đang mở |
| POST | `/ca-lam-viec/mo-ca` | Mở ca |
| PUT | `/ca-lam-viec/{id}/dong-ca` | Đóng ca |

## Dashboard (QuanLy)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/dashboard/tong-quan` | Tổng quan |
| GET | `/dashboard/doanh-thu` | Doanh thu theo khoảng ngày |
| GET | `/dashboard/don-hom-nay` | Đơn hôm nay |
| GET | `/dashboard/top-san-pham` | Top sản phẩm |
| GET | `/dashboard/don-online-cho-xac-nhan` | Đơn online chờ |
| GET | `/dashboard/canh-bao-nguyen-lieu` | Cảnh báo tồn |

## Báo cáo & xuất file (QuanLy)

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/bao-cao/doanh-thu/excel?tuNgay=&denNgay=` | File `.xlsx` |
| GET | `/bao-cao/doanh-thu/pdf?tuNgay=&denNgay=` | File `.pdf` |

Chỉ tính hóa đơn `TrangThaiHoaDon = HoanThanh`. Mặc định 30 ngày gần nhất nếu không truyền ngày.

## Module chưa triển khai (TODO)

- `// TODO [Trần Quốc Tiên]:` CRUD danh mục, sản phẩm, kho, nhập kho
- `// TODO [Nguyễn Hoài Phương]:` POS, hóa đơn, đơn online, voucher, hoàn/hủy
