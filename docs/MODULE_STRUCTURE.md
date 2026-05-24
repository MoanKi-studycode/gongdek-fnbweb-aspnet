# Cấu trúc module GongDek

**Cửa hàng:** GONGDEK TEA & COFFEE — 35 Biệt Thự, Nha Trang, Khánh Hòa | 0354717914 | gongdek_nhom20@gmail.com | 08:00–22:00

**Tài liệu liên quan:** [README.md](../README.md) · [HamXuLy.md](HamXuLy.md) · [API_CONTRACT.md](API_CONTRACT.md)

---

## 1. Trần Anh Tín — đã hoàn thành

### Nghiệp vụ
- Auth JWT: login, register khách, `/api/auth/me`
- Phân quyền 3 role: `QuanLy`, `NhanVien`, `KhachHang`
- Quản lý nhân viên: CRUD, khóa/mở khóa
- Ca làm việc: mở ca, đóng ca, lịch sử, khung ca
- Dashboard: doanh thu, đơn hôm nay, top SP, đơn online chờ, cảnh báo NL
- Báo cáo doanh thu + export Excel (ClosedXML) / PDF (QuestPDF)
- SQL nền: constraint, `ufn_TongDoanhThuTheoNgay`, `vw_TopSanPham`, `sp_BaoCaoDoanhThu`
- Đặt hàng online (write): `POST /api/don-hang-online`
- Cấu trúc backend/frontend, middleware, exception handling

### Cây file (backend)

```text
backend/
├── Controllers/
│   ├── AuthController.cs
│   ├── NhanVienController.cs
│   ├── KhungCaController.cs
│   ├── CaLamViecController.cs
│   ├── DashboardController.cs
│   └── BaoCaoController.cs
├── Services/
│   ├── AuthService.cs
│   ├── NhanVienService.cs
│   ├── KhungCaService.cs
│   ├── CaLamViecService.cs
│   ├── DashboardService.cs
│   ├── BaoCaoService.cs
│   ├── DonHangOnlineWriteService.cs
│   └── Export/
│       ├── ExcelExportService.cs
│       └── PdfExportService.cs
├── Repositories/
│   ├── NhanVienRepository.cs
│   ├── CaLamViecRepository.cs
│   ├── DashboardRepository.cs
│   └── BaoCaoRepository.cs
├── Helpers/
│   ├── JwtHelper.cs
│   ├── PasswordHashHelper.cs
│   └── ProductImagePaths.cs
└── Middlewares/
    └── ExceptionHandlingMiddleware.cs
```

### Cây file (frontend)

```text
frontend/src/
├── pages/auth/
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── pages/admin/
│   ├── DashboardPage.tsx
│   ├── EmployeesPage.tsx
│   ├── ShiftsPage.tsx
│   └── ReportsPage.tsx
├── pages/public/
│   └── Home.tsx
├── components/
│   ├── cart/CartSheet.tsx
│   ├── common/BrandLogo.tsx
│   └── layout/ (AdminLayout, role guards)
├── contexts/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
└── services/
    ├── authService.ts
    ├── employeeService.ts
    ├── shiftService.ts
    ├── dashboardService.ts
    └── reportService.ts
```

---

## 2. Trần Quốc Tiên — cần tiếp tục

### Nghiệp vụ còn lại
- CRUD: danh mục, sản phẩm, size, topping (hiện **GET only**)
- Upload ảnh SP (`/images/products/{maSanPham}.jpg`)
- Nguyên liệu, nhà cung cấp
- Lập / duyệt phiếu nhập kho, cập nhật tồn
- Tìm kiếm sản phẩm theo từ khóa (backend `search`)

### Cây file hiện có

```text
backend/
├── Controllers/
│   ├── DanhMucController.cs      # GET
│   ├── SanPhamController.cs      # GET ?maDanhMuc=
│   ├── SizeController.cs         # GET
│   └── ToppingController.cs      # GET
├── Services/
│   ├── DanhMucService.cs
│   ├── SanPhamService.cs
│   ├── SizeService.cs
│   └── ToppingService.cs
└── wwwroot/images/products/      # ảnh upload

frontend/src/
├── pages/admin/
│   ├── CategoriesPage.tsx
│   ├── ProductsPage.tsx
│   ├── SizeToppingPage.tsx
│   ├── InventoryPage.tsx
│   └── StockInPage.tsx
├── services/
│   ├── categoryService.ts
│   ├── productService.ts
│   └── inventoryService.ts (nếu có)
└── lib/productImage.ts
```

### Cần bổ sung (đề xuất)

```text
backend/Controllers/PhieuNhapKhoController.cs
backend/Services/PhieuNhapKhoService.cs
backend/Services/NguyenLieuService.cs
POST/PUT/DELETE trên DanhMuc, SanPham, Size, Topping
```

---

## 3. Nguyễn Hoài Phương — cần tiếp tục

### Nghiệp vụ còn lại
- POS: `TaoHoaDon`, `XacNhanThanhToan` (API write)
- Workflow đơn online: xác nhận, cập nhật trạng thái, pha chế
- Voucher, khách hàng CRUD, đánh giá, hoàn/hủy đơn

### Cây file hiện có

```text
backend/
├── Controllers/
│   ├── HoaDonController.cs           # GET only
│   └── DonHangOnlineController.cs      # GET + POST (khách)
├── Services/
│   ├── HoaDonReadService.cs
│   ├── DonHangOnlineReadService.cs
│   └── DonHangOnlineWriteService.cs  # CreateAsync ✅

frontend/src/
├── pages/cashier/
│   ├── POSPage.tsx                   # state local, chưa API tạo HD
│   └── POSOrdersOnlinePage.tsx
├── pages/admin/
│   ├── InvoicesPage.tsx
│   ├── OrdersOnlinePage.tsx
│   ├── VouchersPage.tsx
│   └── CustomersPage.tsx
├── contexts/POSContext.tsx
└── services/
    ├── invoiceService.ts (read)
    ├── customerService.ts
    └── voucherService.ts
```

### Cần bổ sung (đề xuất)

```text
backend/Services/HoaDonWriteService.cs
backend/Controllers endpoints: PUT trạng thái đơn online, pha chế
backend/Services/DanhGiaService.cs
frontend: gọi API khi thanh toán POS và xử lý đơn online
```

---

## 4. API theo trạng thái

### Đã có (GET / write Tín)

| Endpoint | Ghi chú |
|----------|---------|
| `/api/auth/*` | Login, register, me |
| `/api/nhan-vien/*` | CRUD + khoa/mo-khoa |
| `/api/khung-ca`, `/api/ca-lam-viec/*` | Ca làm việc |
| `/api/dashboard/*` | Tổng quan, doanh thu, top SP |
| `/api/bao-cao/doanh-thu/excel\|pdf` | Export |
| `POST /api/don-hang-online` | Khách đặt hàng |

### Read-only nền (Quốc Tiên / Hoài Phương mở rộng)

| Endpoint | TODO |
|----------|------|
| `GET /api/danh-muc`, `/san-pham`, `/size`, `/topping` | CRUD + upload ảnh |
| `GET /api/hoa-don`, `/don-hang-online` | Write POS + workflow |

### Ảnh sản phẩm (quy ước chung)

- **Frontend:** `frontend/public/images/products/`
- **Backend static:** `backend/wwwroot/images/products/`
- **URL:** `/images/products/{maSanPham}.jpg`
- **DB `SanPham.HinhAnh`:** ví dụ `/images/products/1.jpg`
- **Helper:** `ProductImagePaths.cs`, `src/lib/productImage.ts`

---

## 5. Phân quyền API (tóm tắt)

| Policy | Role |
|--------|------|
| `QuanLy` | Quản trị, báo cáo, nhân viên, mở/đóng ca (theo controller) |
| `NoiBo` | QuanLy + NhanVien |
| `KhachHang` | Khách đặt online |
| AllowAnonymous | Catalog GET, login, register |
