# HÀM XỬ LÝ NGHIỆP VỤ – GONGDEK

**Mục đích:** Tài liệu tổng hợp các hàm xử lý nghiệp vụ phục vụ mục **2.2. Thiết kế xử lý** trong báo cáo đồ án Công nghệ phần mềm.

**Chú thích trạng thái:**

| Ký hiệu | Ý nghĩa |
|---------|---------|
| ✅ Đã triển khai | Có code backend/API tương ứng |
| ⚠️ Một phần | Logic có nhưng chưa tách hàm riêng hoặc thiếu bước nghiệp vụ |
| ❌ Chưa triển khai | Chỉ có schema/frontend mock, chưa có service write |

---

## DangNhap(tenDangNhapOrEmail, matKhau)

### Mục đích
Xác thực tài khoản người dùng (nhân viên hoặc khách hàng), xác định vai trò và cấp quyền truy cập hệ thống qua JWT.

### Input
- `tenDangNhapOrEmail` — tên đăng nhập (nhân viên) hoặc email (khách hàng)
- `matKhau` — mật khẩu người dùng nhập (plain text, chỉ dùng để so sánh hash)

### Các bảng dữ liệu liên quan
- `NhanVien`, `VaiTro` — đăng nhập quản lý/nhân viên
- `KhachHang` — đăng nhập khách hàng online

### Xử lý
Bước 1: Nhận `LoginDto` từ client (`TenDangNhap` hoặc `Email` + `MatKhau`).
Bước 2: Kiểm tra độ mạnh mật khẩu (`PasswordHashHelper.IsPasswordStrongEnough`).
Bước 3: Nếu có `TenDangNhap` → gọi `LoginEmployeeAsync`: truy vấn `NhanVien` kèm `VaiTro`.
Bước 4: Nếu không có nhân viên → nếu có `Email` → gọi `LoginCustomerAsync`: truy vấn `KhachHang`.
Bước 5: Nếu không tìm thấy tài khoản → ném `UnauthorizedAccessException`.
Bước 6: Kiểm tra trạng thái: nhân viên `Khoa` hoặc khách không `HoatDong` → từ chối đăng nhập.
Bước 7: So sánh mật khẩu với `MatKhauHash` bằng `PasswordHashHelper.VerifyPassword`.
Bước 8: Tạo `UserProfileDto` (Id, HoTen, VaiTro, TenDangNhap/Email).
Bước 9: Sinh JWT qua `JwtHelper.GenerateToken` (`user_type`: `employee` | `customer`).
Bước 10: Trả `LoginResponseDto` gồm token và thông tin người dùng.

### Output
- JWT token
- Thông tin người dùng (`UserProfileDto`)
- Vai trò: `QuanLy`, `NhanVien`, hoặc `KhachHang`

### Ghi chú cài đặt
- ✅ **Backend:** `AuthService.LoginAsync` — `backend/Services/AuthService.cs`
- ✅ **API:** `POST /api/auth/login` — `AuthController`
- Mật khẩu lưu hash, không plain text.
- Role lấy từ bảng `VaiTro` / hằng `TenVaiTro.KhachHang`, không hardcode trên client.

---

## TaoHoaDon()

### Mục đích
Tạo hóa đơn bán tại quầy (POS): ghi header `HoaDon`, chi tiết món, topping, gán ca làm việc và nhân viên lập.

### Input
- Danh sách chi tiết: `MaSanPham`, `MaSize`, số lượng, topping, ghi chú
- `MaNVLap`, `MaCa` (ca đang mở)
- `MaKH` (tùy chọn), mã voucher (tùy chọn)
- `LoaiDon` = `TaiQuay`

### Các bảng dữ liệu liên quan
- `HoaDon`, `ChiTietHoaDon`, `ChiTietHoaDonTopping`
- `SanPham`, `Size`, `Topping`, `CaLamViec`, `KhachHang`, `Voucher`

### Xử lý
Bước 1: Xác thực nhân viên đang đăng nhập (`NhanVien`, policy `NoiBo`).
Bước 2: Kiểm tra ca làm việc đang mở của nhân viên (nếu bắt buộc theo quy trình cửa hàng).
Bước 3: Validate từng dòng: sản phẩm `DangBan`, size hợp lệ, topping hợp lệ.
Bước 4: Tính `DonGiaGoc`, `PhuThuSize`, tổng topping → `ThanhTien` từng dòng.
Bước 5: Cộng `TongTienMon`, áp dụng giảm giá voucher → `TienGiamGia`.
Bước 6: Tính `TongThanhToan`, ghi `HoaDon` trạng thái `ChoThanhToan`.
Bước 7: Lưu `ChiTietHoaDon` và `ChiTietHoaDonTopping`.
Bước 8: Trả mã hóa đơn và tổng tiền chờ thanh toán.

### Output
- `MaHoaDon` mới
- `TongThanhToan`, `TrangThaiHoaDon` = `ChoThanhToan`

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — thuộc module **Nguyễn Hoài Phương** (POS).
- Frontend `POSPage.tsx` + `POSContext` chỉ quản lý giỏ trên state, chưa gọi API tạo hóa đơn.
- Schema và model `HoaDon` đã có; chỉ có **read** qua `HoaDonReadService` / `GET /api/hoa-don`.

---

## TinhTongTienHoaDon(maHoaDon)

### Mục đích
Tính lại hoặc xác định tổng tiền hóa đơn từ chi tiết: giá gốc sản phẩm, phụ thu size, topping, phí giao (đơn online), giảm giá, điểm.

### Input
- `maHoaDon` — mã hóa đơn cần tính

### Các bảng dữ liệu liên quan
- `HoaDon`, `ChiTietHoaDon`, `ChiTietHoaDonTopping`
- `SanPham`, `Size`, `Topping`

### Xử lý
Bước 1: Đọc tất cả `ChiTietHoaDon` theo `MaHoaDon`.
Bước 2: Với mỗi dòng: `ThanhTien = (GiaBanGoc + PhuThuSize + Σ DonGiaTopping) × SoLuong`.
Bước 3: `TongTienMon` = tổng `ThanhTien` các dòng.
Bước 4: Cộng `PhiGiaoHang` (nếu đơn online), trừ `TienGiamGia` và quy đổi `DiemSuDung`.
Bước 5: `TongThanhToan` = `TongTienMon + PhiGiaoHang - TienGiamGia - ...` (theo constraint `CK_HD_TongTien`).
Bước 6: Cập nhật cột tổng trên `HoaDon` (khi chỉnh sửa đơn) hoặc trả kết quả tạm khi tạo đơn.

### Output
- `TongTienMon`, `TienGiamGia`, `PhiGiaoHang`, `TongThanhToan`

### Ghi chú cài đặt
- ⚠️ **Một phần:** logic tính tiền nằm **inline** trong `DonHangOnlineWriteService.CreateAsync` (vòng lặp chi tiết, dòng 60–119), **chưa** tách thành hàm `TinhTongTienHoaDon(maHoaDon)`.
- SQL: constraint `CK_HD_TongTien` trên bảng `HoaDon`.
- Khi có POS write, nên tách `InvoicePricingService` dùng chung POS và online.

---

## XacNhanThanhToan(maHoaDon)

### Mục đích
Xác nhận khách đã thanh toán: cập nhật phương thức thanh toán, thời gian thanh toán, chuyển trạng thái hóa đơn sang luồng xử lý tiếp theo (pha chế / hoàn thành).

### Input
- `maHoaDon`
- `phuongThucThanhToan` — `TienMat` | `ChuyenKhoan` | `ViDienTu`
- (Tùy chọn) số tiền khách đưa, tiền thừa

### Các bảng dữ liệu liên quan
- `HoaDon`, `CaLamViec`

### Xử lý
Bước 1: Tìm `HoaDon` theo `maHoaDon`; kiểm tra `TrangThaiHoaDon` = `ChoThanhToan`.
Bước 2: Validate `TongThanhToan` > 0 và phương thức thanh toán hợp lệ.
Bước 3: Ghi `PhuongThucThanhToan`, `ThoiGianThanhToan` = hiện tại.
Bước 4: Đổi `TrangThaiHoaDon` → `DaThanhToan` (tại quầy) hoặc `ChoPhaChe` (tùy quy trình).
Bước 5: Nếu đơn online → đồng bộ `DonHangOnline.TrangThaiOnline` nếu cần.
Bước 6: Lưu DB và trả hóa đơn đã cập nhật.

### Output
- Hóa đơn với `TrangThaiHoaDon` mới, `ThoiGianThanhToan`

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — module **Nguyễn Hoài Phương**.
- Hằng số: `TrangThaiHoaDon`, `PhuongThucThanhToan` — `backend/Enums/`.
- Đơn online hiện tạo sẵn `DaThanhToan` trong `DonHangOnlineWriteService` (giả định đã chuyển khoản).

---

## TaoDonHangOnline()

### Mục đích
Khách hàng **đã đăng nhập** đặt hàng online: tạo `HoaDon` loại `Online`, chi tiết món, bản ghi `DonHangOnline` trạng thái chờ xác nhận.

### Input
- `DiaChiGiao` (bắt buộc), `GhiChuGiaoHang` (tùy chọn)
- `ChiTiet[]`: `MaSanPham`, `TenSize`, `SoLuong`, `MaToppings`, `GhiChu`
- **Không** nhận `MaKH` từ client — lấy từ JWT

### Các bảng dữ liệu liên quan
- `HoaDon`, `ChiTietHoaDon`, `ChiTietHoaDonTopping`, `DonHangOnline`
- `KhachHang`, `SanPham`, `Size`, `Topping`, `NhanVien`

### Xử lý
Bước 1: Kiểm tra JWT: `user_type` = `customer`, `VaiTro` = `KhachHang`.
Bước 2: Validate địa chỉ giao và giỏ không rỗng.
Bước 3: Load `KhachHang` từ `MaKH` trong token; kiểm tra `HoatDong`.
Bước 4: Chọn `MaNVLap` (nhân viên `QuanLy` hoạt động đầu tiên — placeholder hệ thống).
Bước 5: Với từng món: validate SP, size M/L, topping → tính `ThanhTien`, cộng `tongTienMon`.
Bước 6: `TongThanhToan` = `tongTienMon` + `PhiGiaoHang` (15.000đ mặc định).
Bước 7: Insert `HoaDon` (`LoaiDon.Online`, `DaThanhToan`, `ChuyenKhoan`).
Bước 8: Insert chi tiết và topping.
Bước 9: Insert `DonHangOnline` (`TrangThaiOnline` = `ChoXacNhan`, thông tin nhận hàng từ khách).
Bước 10: Trả `MaHoaDon` và trạng thái online.

### Output
- `MaHoaDon`, `TrangThaiOnline` = `ChoXacNhan`

### Ghi chú cài đặt
- ✅ **Backend:** `DonHangOnlineWriteService.CreateAsync` — `backend/Services/DonHangOnlineWriteService.cs`
- ✅ **API:** `POST /api/don-hang-online` — `[Authorize(Policy = "KhachHang")]`
- ✅ **Frontend:** `CartSheet.tsx` gọi API khi khách đặt hàng.

---

## XacNhanDonOnline(maHoaDon)

### Mục đích
Nhân viên xác nhận đơn online đang `ChoXacNhan`, chuyển sang xử lý (pha chế / chuẩn bị giao).

### Input
- `maHoaDon`
- `maNV` — nhân viên thực hiện (từ token)

### Các bảng dữ liệu liên quan
- `DonHangOnline`, `HoaDon`

### Xử lý
Bước 1: Tìm `DonHangOnline` theo `MaHoaDon`.
Bước 2: Kiểm tra `TrangThaiOnline` = `ChoXacNhan`.
Bước 3: Cập nhật `TrangThaiOnline` → `DangXuLy`.
Bước 4: (Tùy quy trình) cập nhật `HoaDon.TrangThaiHoaDon` → `ChoPhaChe`.
Bước 5: Ghi log thời gian / nhân viên xác nhận nếu có cột mở rộng.
Bước 6: Trả thông tin đơn đã xác nhận.

### Output
- Đơn với `TrangThaiOnline` = `DangXuLy`

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — module **Nguyễn Hoài Phương**.
- ✅ **Đọc danh sách chờ:** `DashboardRepository.GetDonOnlineChoXacNhanAsync`, `GET /api/don-hang-online`.
- Hằng: `TrangThaiDonHangOnline` — `backend/Enums/TrangThaiConstants.cs`.

---

## CapNhatTrangThaiDonOnline(maHoaDon, trangThaiMoi)

### Mục đích
Cập nhật tiến trình đơn online: đang xử lý → đang giao → hoàn thành hoặc hủy.

### Input
- `maHoaDon`
- `trangThaiMoi` — `DangXuLy` | `DangGiao` | `HoanThanh` | `DaHuy`

### Các bảng dữ liệu liên quan
- `DonHangOnline`, `HoaDon`

### Xử lý
Bước 1: Load `DonHangOnline` + `HoaDon`.
Bước 2: Kiểm tra chuyển trạng thái hợp lệ (state machine: không nhảy bước).
Bước 3: Cập nhật `TrangThaiOnline` = `trangThaiMoi`.
Bước 4: Nếu `HoanThanh` → đồng bộ `HoaDon.TrangThaiHoaDon` = `HoanThanh`.
Bước 5: Nếu `DaHuy` → cập nhật `HoaDon.TrangThaiHoaDon` = `DaHuy`, xử lý hoàn tiền (nếu có).
Bước 6: Lưu và trả DTO chi tiết đơn.

### Output
- Trạng thái online và hóa đơn sau cập nhật

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — module **Nguyễn Hoài Phương**.
- Frontend: `POSOrdersOnlinePage.tsx`, `admin/OrdersOnlinePage.tsx` — UI có, chưa API PUT/PATCH.

---

## CapNhatTrangThaiPhaChe(maHoaDon)

### Mục đích
Nhân viên/quầy pha chế đánh dấu đã hoàn thành pha chế hoặc hoàn thành đơn (tại quầy hoặc online).

### Input
- `maHoaDon`
- (Tùy chọn) hành động: `HoanThanhPhaChe` | `HoanThanhDon`

### Các bảng dữ liệu liên quan
- `HoaDon`, `DonHangOnline`

### Xử lý
Bước 1: Tìm `HoaDon`; kiểm tra `TrangThaiHoaDon` ∈ {`DaThanhToan`, `ChoPhaChe`}.
Bước 2: Cập nhật `TrangThaiHoaDon` → `ChoPhaChe` hoặc `HoanThanh`.
Bước 3: Nếu có `DonHangOnline` và đơn giao hàng → có thể chuyển `DangGiao`.
Bước 4: Ghi thời gian hoàn thành nếu có cột audit.
Bước 5: Trả trạng thái mới.

### Output
- `TrangThaiHoaDon`, (đồng bộ) `TrangThaiOnline`

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — module **Nguyễn Hoài Phương**.
- Hằng `TrangThaiHoaDon.ChoPhaChe`, `HoanThanh` đã định nghĩa trong schema/EF.

---

## MoCaLamViec(maNhanVien, maKhungCa, tienQuyDauCa)

### Mục đích
Mở ca làm việc cho nhân viên: ghi thời gian mở, tiền quỹ đầu ca, liên kết khung ca.

### Input
- `maNhanVien` (`MaNV`)
- `maKhungCa` (`MaKhungCa`)
- `tienQuyDauCa`
- (Tùy chọn) `NgayLam`, `GhiChu`

### Các bảng dữ liệu liên quan
- `CaLamViec`, `KhungCa`, `NhanVien`

### Xử lý
Bước 1: Validate `KhungCa` tồn tại và `HoatDong`.
Bước 2: Validate `NhanVien` tồn tại và `HoatDong`.
Bước 3: Kiểm tra nhân viên **chưa** có ca `DangMo` (`HasOpenShiftAsync`).
Bước 4: Tạo bản ghi `CaLamViec`: `ThoiGianMo` = UTC now, `TienQuyDauCa`, `TrangThaiCa` = `DangMo`.
Bước 5: Lưu DB và trả `CaLamViecDto`.

### Output
- `MaCa`, thông tin ca vừa mở

### Ghi chú cài đặt
- ✅ **Backend:** `CaLamViecService.MoCaAsync` — `backend/Services/CaLamViecService.cs`
- ✅ **API:** `POST /api/ca-lam-viec` — `CaLamViecController` (policy `QuanLy`)

---

## DongCaLamViec(maCa, tienMatThucTe)

### Mục đích
Đóng ca: ghi thời gian đóng, tiền mặt thực tế để đối soát với doanh thu ca.

### Input
- `maCa`
- `tienMatThucTe`
- (Tùy chọn) `GhiChu`

### Các bảng dữ liệu liên quan
- `CaLamViec`

### Xử lý
Bước 1: Tìm `CaLamViec` theo `maCa`.
Bước 2: Kiểm tra `TrangThaiCa` = `DangMo`.
Bước 3: Ghi `ThoiGianDong`, `TienMatThucTe`, `TrangThaiCa` = `DaDong`.
Bước 4: Nối `GhiChu` nếu có.
Bước 5: Lưu và trả DTO ca đã đóng.

### Output
- Ca làm việc trạng thái `DaDong`, tiền mặt thực tế

### Ghi chú cài đặt
- ✅ **Backend:** `CaLamViecService.DongCaAsync`
- ✅ **API:** `PUT /api/ca-lam-viec/{id}/dong-ca`

---

## ThemNhanVien()

### Mục đích
Quản lý tạo tài khoản nhân viên mới (QuanLy hoặc NhanVien), hash mật khẩu, gán vai trò.

### Input
- `HoTen`, `TenDangNhap`, `MatKhau`, `MaVaiTro`
- `SoDienThoai`, `NgaySinh`, `GioiTinh`, `DiaChi` (tùy chọn)

### Các bảng dữ liệu liên quan
- `NhanVien`, `VaiTro`

### Xử lý
Bước 1: Validate vai trò thuộc `QuanLy` hoặc `NhanVien` (`AllowedRoles`).
Bước 2: Kiểm tra trùng `TenDangNhap`, `SoDienThoai`.
Bước 3: Kiểm tra độ mạnh mật khẩu.
Bước 4: Hash mật khẩu → `MatKhauHash`.
Bước 5: Insert `NhanVien`, `TrangThai` = `HoatDong`, `NgayTao` = UTC.
Bước 6: Trả `NhanVienDto`.

### Output
- Thông tin nhân viên vừa tạo (không trả mật khẩu)

### Ghi chú cài đặt
- ✅ **Backend:** `NhanVienService.CreateAsync` — `backend/Services/NhanVienService.cs`
- ✅ **API:** `POST /api/nhan-vien` — policy `QuanLy`
- ✅ **Frontend:** `admin/EmployeesPage.tsx`

---

## KhoaTaiKhoanNhanVien(maNhanVien)

### Mục đích
Khóa tài khoản nhân viên (soft delete): không xóa bản ghi, chỉ đổi trạng thái để không đăng nhập được.

### Input
- `maNhanVien` (id)

### Các bảng dữ liệu liên quan
- `NhanVien`

### Xử lý
Bước 1: Tìm nhân viên theo id.
Bước 2: Nếu đã `Khoa` → báo lỗi nghiệp vụ.
Bước 3: Cập nhật `TrangThai` = `Khoa`.
Bước 4: Lưu DB; lần đăng nhập sau `LoginEmployeeAsync` sẽ từ chối.

### Output
- `NhanVienDto` với `TrangThai` = `Khoa`

### Ghi chú cài đặt
- ✅ **Backend:** `NhanVienService.LockAsync`
- ✅ **API:** `PUT /api/nhan-vien/{id}/khoa`
- Có thêm `UnlockAsync` / `PUT .../mo-khoa` — không xóa vật lý bảng `NhanVien`.

---

## ThongKeDoanhThu(tuNgay, denNgay)

### Mục đích
Thống kê tổng doanh thu và số hóa đơn trong khoảng thời gian (dashboard / báo cáo).

### Input
- `tuNgay`, `denNgay` (DateOnly, tùy chọn — mặc định 30 ngày gần nhất)

### Các bảng dữ liệu liên quan
- `HoaDon`

### Xử lý
Bước 1: Chuẩn hóa khoảng ngày (`ResolveDateRange` hoặc logic tương tự trong dashboard).
Bước 2: Lọc hóa đơn đã thanh toán / hoàn thành (`TrangThaiHoaDonDaThanhToan` hoặc `HoanThanh` tùy endpoint).
Bước 3: Lọc `ThoiGianLap` trong [tu, den].
Bước 4: `SUM(TongThanhToan)`, `COUNT(MaHoaDon)`.
Bước 5: (Báo cáo chi tiết) trả thêm danh sách từng hóa đơn.

### Output
- `TongDoanhThu`, `SoHoaDon`, (báo cáo) `ChiTiet[]`

### Ghi chú cài đặt
- ✅ **Dashboard:** `DashboardService.GetDoanhThuAsync` + `DashboardRepository.SumDoanhThuAsync`
- ✅ **API:** `GET /api/dashboard/doanh-thu?tuNgay=&denNgay=`
- ✅ **Báo cáo tổng hợp:** `BaoCaoService.GetBaoCaoDoanhThuAsync` — `BaoCaoRepository` (lọc `HoanThanh`)
- **SQL (schema, chưa gọi từ C#):** `ufn_TongDoanhThuTheoNgay`, `sp_BaoCaoDoanhThu`

---

## ThongKeTopSanPham(tuNgay, denNgay)

### Mục đích
Lấy danh sách sản phẩm bán chạy theo số lượng trong khoảng thời gian.

### Input
- `tuNgay`, `denNgay`
- `limit` (số dòng, mặc định 5–10)

### Các bảng dữ liệu liên quan
- `ChiTietHoaDon`, `HoaDon`, `SanPham`

### Xử lý
Bước 1: Chuẩn hóa khoảng ngày.
Bước 2: Join chi tiết hóa đơn với hóa đơn đã thanh toán trong kỳ.
Bước 3: `GROUP BY MaSanPham, TenSanPham`, `SUM(SoLuong)`.
Bước 4: `ORDER BY SoLuong DESC`, `TAKE limit`.
Bước 5: Trả danh sách `TopSanPhamDto`.

### Output
- Danh sách `{ TenSanPham, SoLuong }`

### Ghi chú cài đặt
- ✅ **Backend:** `DashboardService.GetTopSanPhamAsync` → `DashboardRepository.GetTopSanPhamAsync`
- ✅ **API:** `GET /api/dashboard/top-san-pham`
- **SQL (schema):** view `vw_TopSanPham` — backend hiện dùng **EF LINQ**, không gọi view trực tiếp.

---

## XuatBaoCaoExcel(tuNgay, denNgay)

### Mục đích
Xuất báo cáo doanh thu chi tiết ra file Excel phục vụ quản lý và nộp báo cáo.

### Input
- `tuNgay`, `denNgay` (query string)

### Các bảng dữ liệu liên quan
- `HoaDon`, `NhanVien` (qua `BaoCaoRepository`)

### Xử lý
Bước 1: Gọi `BaoCaoService.GetBaoCaoDoanhThuAsync` lấy `BaoCaoDoanhThuTongHopDto`.
Bước 2: `ExcelExportService.ExportBaoCaoDoanhThu` dựng workbook ClosedXML (tiêu đề, tổng hợp, bảng chi tiết).
Bước 3: Trả file `.xlsx` với tên `BaoCaoDoanhThu_GongDek_yyyyMMdd.xlsx`.

### Output
- File binary Excel (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

### Ghi chú cài đặt
- ✅ **Backend:** `ExcelExportService` — `backend/Services/Export/ExcelExportService.cs`
- ✅ **API:** `GET /api/bao-cao/doanh-thu/excel` — `BaoCaoController`, policy `QuanLy`
- Thư viện: **ClosedXML**

---

## XuatBaoCaoPDF(tuNgay, denNgay)

### Mục đích
Xuất cùng dữ liệu báo cáo doanh thu ra PDF để in hoặc lưu trữ.

### Input
- `tuNgay`, `denNgay`

### Các bảng dữ liệu liên quan
- Giống `XuatBaoCaoExcel`

### Xử lý
Bước 1: Lấy `BaoCaoDoanhThuTongHopDto` từ `BaoCaoService`.
Bước 2: `PdfExportService.ExportBaoCaoDoanhThu` — QuestPDF layout bảng chi tiết.
Bước 3: Trả file `.pdf`.

### Output
- File PDF (`application/pdf`)

### Ghi chú cài đặt
- ✅ **Backend:** `PdfExportService` — `backend/Services/Export/PdfExportService.cs`
- ✅ **API:** `GET /api/bao-cao/doanh-thu/pdf`
- Thư viện: **QuestPDF**

---

## LapPhieuNhapKho()

### Mục đích
Lập phiếu nhập kho ở trạng thái chờ duyệt: ghi nhà cung cấp, chi tiết nguyên liệu, tổng tiền nhập.

### Input
- `MaNCC`, `MaNVLap`, danh sách chi tiết (`MaNL`, `SoLuong`, `DonGia`)
- (Tùy chọn) ghi chú

### Các bảng dữ liệu liên quan
- `PhieuNhapKho`, `ChiTietPhieuNhap`, `NguyenLieu`, `NhaCungCap`, `NhanVien`

### Xử lý
Bước 1: Validate nhà cung cấp và nguyên liệu tồn tại.
Bước 2: Tính `TongTienNhap` từ chi tiết.
Bước 3: Insert `PhieuNhapKho` trạng thái `ChoDuyet` (theo thiết kế schema).
Bước 4: Insert các dòng `ChiTietPhieuNhap`.
Bước 5: **Chưa** cộng tồn kho cho đến khi duyệt.
Bước 6: Trả `MaPhieuNhap`.

### Output
- Phiếu nhập mới, trạng thái chờ duyệt

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — module **Trần Quốc Tiên** (kho).
- ✅ **Schema + EF:** bảng `PhieuNhapKho`, `ChiTietPhieuNhap` — `database/schema.sql`, `GongDekDbContext`
- Frontend `admin/StockInPage.tsx` — UI, chưa API write.

---

## DuyetPhieuNhapKho(maPhieuNhap)

### Mục đích
Quản lý duyệt phiếu nhập: cập nhật trạng thái phiếu và **cộng** số lượng tồn `NguyenLieu`.

### Input
- `maPhieuNhap`
- `maNVDuyet`

### Các bảng dữ liệu liên quan
- `PhieuNhapKho`, `ChiTietPhieuNhap`, `NguyenLieu`

### Xử lý
Bước 1: Load phiếu + chi tiết; kiểm tra trạng thái `ChoDuyet`.
Bước 2: Ghi `MaNVDuyet`, `NgayDuyet`, trạng thái `DaDuyet`.
Bước 3: Với mỗi dòng chi tiết: `NguyenLieu.SoLuongTon += SoLuongNhap`.
Bước 4: Transaction — rollback nếu lỗi tồn âm hoặc vi phạm constraint.
Bước 5: Trả phiếu đã duyệt.

### Output
- Phiếu trạng thái đã duyệt, tồn kho đã cập nhật

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — module **Trần Quốc Tiên**.
- Có thể bổ sung **trigger** SQL hoặc xử lý trong `PhieuNhapKhoService` (chưa có file).

---

## TimKiemSanPham(tuKhoa, maDanhMuc)

### Mục đích
Tìm kiếm và lọc sản phẩm hiển thị menu / POS / trang chủ theo từ khóa và danh mục.

### Input
- `tuKhoa` — chuỗi tìm trong tên/mô tả (tùy chọn)
- `maDanhMuc` — lọc theo danh mục (tùy chọn)

### Các bảng dữ liệu liên quan
- `SanPham`, `DanhMuc`

### Xử lý
Bước 1: Khởi tạo query `SanPham` Include `DanhMuc`.
Bước 2: Nếu có `maDanhMuc` → `Where(MaDanhMuc = ...)`.
Bước 3: Nếu có `tuKhoa` → `Where(TenSanPham.Contains(...) || MoTa.Contains(...))` (không phân biệt hoa thường nếu cấu hình).
Bước 4: Chỉ lấy `TrangThai = DangBan` (khi áp dụng cho khách).
Bước 5: Sắp xếp theo tên, map `SanPhamDto`.

### Output
- Danh sách sản phẩm thỏa điều kiện

### Ghi chú cài đặt
- ⚠️ **Một phần:** `SanPhamService.GetAllAsync(maDanhMuc)` — **chỉ lọc danh mục**, chưa lọc `tuKhoa` — `backend/Services/SanPhamService.cs`
- ✅ **API:** `GET /api/san-pham?maDanhMuc=`
- **Frontend:** `Home.tsx` lọc từ khóa **phía client** trên danh sách đã tải.
- TODO: bổ sung tham số `search` — module **Trần Quốc Tiên**.

---

## GuiDanhGiaSanPham(maHoaDon, maSanPham, soSao, noiDung)

### Mục đích
Khách hàng đánh giá sản phẩm sau khi có hóa đơn hoàn thành, lưu điểm sao và nội dung.

### Input
- `maHoaDon`, `maSanPham`
- `soSao` (1–5)
- `noiDung` (tùy chọn)
- `maKH` từ JWT

### Các bảng dữ liệu liên quan
- `DanhGia`, `HoaDon`, `SanPham`, `KhachHang`, `ChiTietHoaDon`

### Xử lý
Bước 1: Xác thực khách hàng đăng nhập.
Bước 2: Kiểm tra `HoaDon` thuộc khách, trạng thái `HoanThanh` (hoặc đã giao xong).
Bước 3: Kiểm tra sản phẩm có trong chi tiết hóa đơn.
Bước 4: Kiểm tra chưa đánh giá trùng (MaHoaDon + MaSanPham + MaKH) nếu có ràng buộc nghiệp vụ.
Bước 5: Validate `soSao` ∈ [1,5] (constraint `CK_DG_SoSao`).
Bước 6: Insert `DanhGia`, `NgayDanhGia` = now.
Bước 7: Trả xác nhận.

### Output
- Bản ghi đánh giá mới (`MaDanhGia`)

### Ghi chú cài đặt
- ❌ **Chưa triển khai** — module **Nguyễn Hoài Phương**.
- ✅ **Schema + model:** `DanhGia` — `database/schema.sql`, `backend/Models/DanhGia.cs`
- Chưa có `DanhGiaController` / service.

---

## Bảng tổng hợp trạng thái triển khai

| STT | Hàm | Trạng thái | File / API chính |
|-----|-----|------------|------------------|
| 1 | DangNhap | ✅ | `AuthService.LoginAsync`, `POST /api/auth/login` |
| 2 | TaoHoaDon | ❌ | Module Hoài Phương — POS |
| 3 | TinhTongTienHoaDon | ⚠️ | Inline trong `DonHangOnlineWriteService.CreateAsync` |
| 4 | XacNhanThanhToan | ❌ | Module Hoài Phương |
| 5 | TaoDonHangOnline | ✅ | `DonHangOnlineWriteService.CreateAsync`, `POST /api/don-hang-online` |
| 6 | XacNhanDonOnline | ❌ | Module Hoài Phương |
| 7 | CapNhatTrangThaiDonOnline | ❌ | Module Hoài Phương |
| 8 | CapNhatTrangThaiPhaChe | ❌ | Module Hoài Phương |
| 9 | MoCaLamViec | ✅ | `CaLamViecService.MoCaAsync` |
| 10 | DongCaLamViec | ✅ | `CaLamViecService.DongCaAsync` |
| 11 | ThemNhanVien | ✅ | `NhanVienService.CreateAsync` |
| 12 | KhoaTaiKhoanNhanVien | ✅ | `NhanVienService.LockAsync` |
| 13 | ThongKeDoanhThu | ✅ | `DashboardService`, `BaoCaoService` |
| 14 | ThongKeTopSanPham | ✅ | `DashboardRepository.GetTopSanPhamAsync` |
| 15 | XuatBaoCaoExcel | ✅ | `ExcelExportService`, `GET .../excel` |
| 16 | XuatBaoCaoPDF | ✅ | `PdfExportService`, `GET .../pdf` |
| 17 | LapPhieuNhapKho | ❌ | Module Quốc Tiên — schema có |
| 18 | DuyetPhieuNhapKho | ❌ | Module Quốc Tiên |
| 19 | TimKiemSanPham | ⚠️ | Lọc DM: `SanPhamService`; từ khóa: FE client |
| 20 | GuiDanhGiaSanPham | ❌ | Module Hoài Phương — schema có |
