# GongDek Tea & Coffee

Hệ thống quản lý quán trà sữa: POS, đặt hàng online, quản trị và báo cáo.

**Địa chỉ:** 35 Biệt Thự, Nha Trang · **SĐT:** 0354717914 · **Email:** gongdek_nhom20@gmail.com

## Công nghệ

ASP.NET Core 8 · React + TypeScript + Vite · SQL Server · JWT · Sonner (toast)

## Cấu trúc thư mục

```text
backend/     API REST, JWT, upload ảnh (wwwroot/images/products)
frontend/    Giao diện web (admin, POS, khách hàng)
database/    schema.sql, seed.sql
```

## Tính năng & đường dẫn

| Vai trò | Đường dẫn | Chức năng |
|---------|-----------|-----------|
| **Quản lý** | `/admin/*` | Dashboard, sản phẩm, kho, nhà cung cấp, nhân viên, ca làm, khách hàng, hóa đơn, đơn online, đánh giá (`/admin/reviews`), báo cáo |
| **Nhân viên** | `/employee/pos` | POS — bán tại quầy, thanh toán, tạo hóa đơn |
| | `/employee/orders-online` | Xử lý đơn đặt online (xác nhận, pha chế, giao hàng) |
| | `/employee/invoices` | Quản lý hóa đơn — tra cứu POS/online, chi tiết, xuất PDF |
| | `/employee/customers` | Tra cứu khách hàng — xem thông tin, điểm tích lũy (chỉ đọc) |
| | `/employee/shifts` | Ca làm việc (chấm công) |
| **Khách hàng** | `/` | Menu, giỏ hàng, đặt online, xem đánh giá sản phẩm |
| | `/customer/home` | Tài khoản, lịch sử đơn, đánh giá sau khi hoàn thành |

## Tạo database

Tạo DB trống `GongDek`, chạy `schema.sql` rồi `seed.sql` (một lần trên DB mới).

```powershell
cd database
sqlcmd -S localhost -d GongDek -E -i schema.sql -f 65001
sqlcmd -S localhost -d GongDek -E -i seed.sql -f 65001
```

`schema.sql` gồm 20 bảng (danh mục, sản phẩm, hóa đơn, đơn online, kho, ca làm, voucher, đánh giá, …).

## Chạy backend

```powershell
cd backend
copy appsettings.example.json appsettings.Development.json
# Chỉnh ConnectionStrings và Jwt:Key
dotnet watch run --launch-profile http
```

API: http://localhost:5256 · Swagger: http://localhost:5256/swagger

## Chạy frontend

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Web: http://localhost:5173 (proxy `/api` và `/images/products` → backend)

## Tài khoản mẫu

| Vai trò | Đăng nhập | Mật khẩu |
|---------|-----------|----------|
| Quản lý | `admin` | `Admin@123` |
| Nhân viên | `nhanvien` | `Nhanvien@123` |
| Khách hàng | `khachhang@gongdek.vn` | `Khachhang@123` |

## Module theo thành viên

| Thành viên | Phụ trách |
|------------|-----------|
| **Trần Anh Tín** | Auth JWT, nhân viên, ca làm, dashboard, báo cáo Excel/PDF |
| **Trần Quốc Tiên** | Danh mục, sản phẩm, size/topping, kho, nhà cung cấp, phiếu nhập |
| **Nguyễn Hoài Phương** | POS, đơn online, voucher, khách hàng, đánh giá, hóa đơn nhân viên, xuất PDF |

## GitLab workflow

Repository: https://gitlab.com/moanki-studycode-group/GongDek

1. `git pull origin main` trước khi làm việc
2. Tạo branch: `feature/<ten-thanh-vien>-<noi-dung>`
3. Commit rõ ràng, push và merge request vào `main`
4. Không commit secret — xem mục bảo mật bên dưới

## Bảo mật

- Chỉ commit file mẫu: `backend/appsettings.example.json`, `frontend/.env.example`
- File local (gitignore): `backend/appsettings.Development.json`, `frontend/.env`
- Production: biến môi trường `ConnectionStrings__DefaultConnection`, `Jwt__Key`
- Frontend chỉ chứa `VITE_API_BASE_URL` — không embed JWT/DB password

**Doanh thu:** Dashboard và báo cáo Excel/PDF dùng chung tiêu chí hóa đơn đã thanh toán (`DaThanhToan`, `ChoPhaChe`, `HoanThanh`).

## Build

```powershell
cd backend; dotnet build
cd ../frontend; npm run build
```

## Dữ liệu mẫu (seed.sql)

| Nội dung | Số lượng |
|----------|----------|
| Danh mục | 5 |
| Sản phẩm | 31 |
| Khách hàng | 41 |
| Nhân viên | 11 |
| Hóa đơn mẫu | 175 (POS + online, T1/2026–nay) |
| Voucher | 4 |
| Phiếu nhập kho | ~24 tháng (SEED_PNK) |
| Đánh giá | Tự sinh từ đơn hoàn thành |
