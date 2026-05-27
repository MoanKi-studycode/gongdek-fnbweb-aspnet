# GONGDEK TEA & COFFEE MANAGEMENT SYSTEM

## 1. Giới thiệu dự án

Hệ thống quản lý cửa hàng trà sữa **GongDek Tea & Coffee**, hỗ trợ bán hàng tại quầy (POS), đặt hàng online, quản trị nội bộ và báo cáo doanh thu. Dự án gồm backend ASP.NET Core Web API và frontend React, phân quyền theo ba vai trò: **QuanLy**, **NhanVien**, **KhachHang**.

Tài liệu thiết kế xử lý nghiệp vụ (mục 2.2 báo cáo): [docs/HamXuLy.md](docs/HamXuLy.md).

## 2. Thông tin cửa hàng

| Mục | Nội dung |
|-----|----------|
| Tên | GONGDEK TEA & COFFEE |
| Địa chỉ | 35 Biệt Thự, Nha Trang, Khánh Hòa |
| SĐT | 0354717914 |
| Email | gongdek_nhom20@gmail.com |
| Giờ hoạt động | 08:00 – 22:00 |

## 3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Backend | ASP.NET Core 8 Web API, Entity Framework Core |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | Microsoft SQL Server |
| Xác thực | JWT Bearer Token |
| Export báo cáo | ClosedXML (Excel), QuestPDF (PDF) |
| Quản lý mã nguồn | GitLab |

## 4. Cấu trúc thư mục

```text
GongDek_Nhom20/
├── backend/                 # ASP.NET Core Web API
│   ├── Controllers/         # REST API theo module
│   ├── Services/            # Xử lý nghiệp vụ
│   ├── Repositories/        # Truy vấn dữ liệu
│   ├── Models/              # Entity EF Core
│   ├── DTOs/                # Đối tượng trao đổi API
│   ├── Helpers/             # JWT, hash mật khẩu, đường dẫn ảnh SP
│   ├── Middlewares/         # Xử lý lỗi API thống nhất
│   ├── Data/                # GongDekDbContext
│   └── wwwroot/             # File tĩnh (ảnh sản phẩm upload)
├── frontend/                # Ứng dụng React
│   ├── public/images/       # Ảnh tĩnh (icon, background, products)
│   └── src/
│       ├── pages/           # Trang theo role (admin, employee, customer, public)
│       ├── components/      # UI tái sử dụng
│       ├── services/        # Gọi API
│       ├── contexts/        # Auth, Cart, POS
│       └── lib/             # Helper (productImage, authRedirect)
├── database/
│   ├── schema.sql           # Tạo CSDL + constraint/view/function/procedure
│   └── seed.sql             # Dữ liệu mẫu (UTF-8)
├── docs/
│   ├── HamXuLy.md           # Hàm xử lý nghiệp vụ (báo cáo 2.2)
│   ├── MODULE_STRUCTURE.md  # Phân công module theo thành viên
│   └── API_CONTRACT.md      # Hợp đồng API
└── README.md
```

**Giải thích nhanh:**

- **backend/** — Toàn bộ logic server, API, bảo mật, export.
- **frontend/** — Giao diện khách (trang chủ, giỏ hàng), admin, nhân viên POS.
- **database/** — Script SQL tạo và seed database; không dùng `SeedData.cs`.
- **docs/** — Tài liệu phục vụ báo cáo và phối hợp nhóm.

## 5. Cách tạo database

1. Mở **SQL Server Management Studio** (hoặc `sqlcmd`).
2. Chạy `database/schema.sql` — tạo bảng, ràng buộc, view, function, stored procedure.
3. Chạy `database/seed.sql` — dữ liệu mẫu (tài khoản, danh mục, sản phẩm, hóa đơn demo).

> **Lưu ý:** File SQL phải lưu **UTF-8** (không BOM) để tiếng Việt hiển thị đúng. Không seed bằng C#.

Connection string cấu hình tại `backend/appsettings.json` → `ConnectionStrings:DefaultConnection`.

## 6. Cách chạy backend

**Cách 1 — Visual Studio:** Mở solution/project trong `backend/`, chọn profile `http`, F5.

**Cách 2 — CLI:**

```powershell
cd backend
dotnet restore
dotnet run --launch-profile http
```

API mặc định: `http://localhost:5256` — Swagger: `http://localhost:5256/swagger`.

## 7. Cách chạy frontend

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Ứng dụng: `http://localhost:5173` — biến `VITE_API_BASE_URL` trỏ tới `http://localhost:5256/api`.

## 8. Tài khoản đăng nhập mẫu

| Vai trò | Tài khoản | Mật khẩu |
|---------|-----------|----------|
| Quản lý | `admin` | `Admin@123` |
| Nhân viên | `nhanvien` | `Nhanvien@123` |
| Khách hàng | `khachhang@gongdek.vn` | `Khachhang@123` |

Mật khẩu trong database được lưu dạng **hash** (không plain text).

## 9. Mô hình role

Hệ thống chỉ có **3 role**:

| Role | Mô tả |
|------|--------|
| **QuanLy** | Quản trị toàn hệ thống: nhân viên, ca, báo cáo, dashboard |
| **NhanVien** | Vận hành tại quầy: POS, xử lý đơn online (bán hàng, pha chế, thu ngân) |
| **KhachHang** | Khách đặt hàng online, xem tài khoản |

Nhân viên **không** tách role ThuNgan/Barista — một tài khoản `NhanVien` dùng chung cho bán hàng, pha chế và xử lý đơn tại quầy.

## 10. Module đã hoàn thành

### Trần Anh Tín (đã triển khai)

- Xác thực JWT: đăng nhập, đăng ký khách, phân quyền 3 role
- Quản lý nhân viên: CRUD, khóa/mở khóa tài khoản
- Quản lý ca làm việc: mở ca, đóng ca, lịch sử ca
- Dashboard quản trị: doanh thu, đơn hôm nay, top sản phẩm, cảnh báo nguyên liệu
- Báo cáo doanh thu + export Excel/PDF
- Cấu trúc backend/frontend nền, middleware, exception handling
- SQL nền: constraint, `ufn_TongDoanhThuTheoNgay`, `vw_TopSanPham`, `sp_BaoCaoDoanhThu`
- API read-only catalog & hóa đơn (nền cho frontend hiển thị dữ liệu thật)
- Đặt hàng online cơ bản: `POST /api/don-hang-online` (khách đăng nhập)
- Frontend: trang chủ, giỏ hàng, auth, admin dashboard/nhân viên/ca/báo cáo, layout role

### Trần Quốc Tiên (đã hoàn thành — đã merge `main`)

- CRUD danh mục, sản phẩm, size, topping
- Upload ảnh: `POST /api/san-pham/{id}/upload-anh`
- Nguyên liệu, nhà cung cấp, phiếu nhập kho (lập / duyệt / cập nhật tồn)
- Tìm kiếm sản phẩm: `GET /api/san-pham?search=`
- Frontend admin: Products, Categories, Inventory, StockIn, Size/Topping
- Seed mẫu kho trong `database/seed.sql`

### Nguyễn Hoài Phương (cần tiếp tục)

- POS tại quầy: tạo hóa đơn, thanh toán (frontend POS hiện mô phỏng)
- Workflow đơn online: xác nhận, cập nhật trạng thái, pha chế, giao hàng
- Voucher, khách hàng CRUD, đánh giá sản phẩm, hoàn/hủy đơn
- Frontend: POSOrdersOnlinePage xử lý trạng thái qua API write

## 11. API chính

### Auth (AllowAnonymous / Authorize)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register-customer` | Đăng ký khách |
| GET | `/api/auth/me` | Thông tin phiên |
| POST | `/api/auth/logout` | Đăng xuất |

### Quản lý (QuanLy)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET/POST/PUT | `/api/nhan-vien/*` | Nhân viên |
| PUT | `/api/nhan-vien/{id}/khoa` | Khóa tài khoản |
| GET | `/api/khung-ca` | Khung ca |
| GET/POST/PUT | `/api/ca-lam-viec/*` | Ca làm việc |
| GET | `/api/dashboard/*` | Dashboard |
| GET | `/api/bao-cao/doanh-thu/excel` | Export Excel |
| GET | `/api/bao-cao/doanh-thu/pdf` | Export PDF |

### Catalog & kho

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET/POST/PUT/DELETE | `/api/danh-muc` | Danh mục (write: QuanLy) |
| GET/POST/PUT/DELETE | `/api/san-pham` | Sản phẩm + `?search=` |
| POST | `/api/san-pham/{id}/upload-anh` | Upload ảnh (QuanLy) |
| GET/POST/PUT/DELETE | `/api/size`, `/api/topping` | Size, topping |
| GET/POST/PUT/DELETE | `/api/nguyen-lieu` | Nguyên liệu |
| GET/POST/PUT/DELETE | `/api/nha-cung-cap` | Nhà cung cấp |
| GET/POST/PUT/DELETE | `/api/phieu-nhap-kho` | Phiếu nhập |
| PUT | `/api/phieu-nhap-kho/{id}/duyet` | Duyệt phiếu, cộng tồn |

### Hóa đơn & đơn online

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|--------|
| GET | `/api/hoa-don` | NoiBo | Danh sách hóa đơn |
| GET | `/api/hoa-don/{id}` | NoiBo | Chi tiết |
| GET | `/api/don-hang-online` | NoiBo | Danh sách đơn online |
| GET | `/api/don-hang-online/{id}` | NoiBo | Chi tiết |
| POST | `/api/don-hang-online` | KhachHang | Khách đặt hàng online |

## 12. GitLab workflow

1. **Không** code trực tiếp trên nhánh `main`.
2. Tạo branch riêng theo module, ví dụ: `feature/tin-auth`, `feature/quoctien-product`, `feature/hoaiphuong-pos`.
3. **Pull/rebase `main`** trước khi bắt đầu hoặc trước khi merge.
4. Commit message rõ nội dung thay đổi.
5. Push branch và tạo **Merge Request** trên GitLab.
6. Chỉ merge khi build backend + frontend pass.
7. Xử lý conflict cẩn thận — **không overwrite** code người khác nếu chưa hiểu thay đổi.

## 13. Kiểm tra build

```powershell
cd backend
dotnet build

cd ..\frontend
npm run build
```

## 14. Tài liệu liên quan

- [docs/HamXuLy.md](docs/HamXuLy.md) — 20 hàm xử lý nghiệp vụ (mục 2.2 báo cáo)
- [docs/MODULE_STRUCTURE.md](docs/MODULE_STRUCTURE.md) — Phân công và cây file theo module
- [docs/API_CONTRACT.md](docs/API_CONTRACT.md) — Chi tiết hợp đồng API
