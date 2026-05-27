# 2.2. THIẾT KẾ XỬ LÝ

## Giới thiệu

**Thiết kế xử lý** là giai đoạn mô tả cách hệ thống biến đổi dữ liệu đầu vào thành kết quả nghiệp vụ mong muốn. Mỗi **hàm xử lý** đại diện cho một chức năng nghiệp vụ cụ thể: nhận dữ liệu, kiểm tra ràng buộc, đọc hoặc ghi các bảng dữ liệu liên quan, tính toán (nếu cần) và trả kết quả cho lớp giao diện.

Trong hệ thống quản lý cửa hàng GongDek Tea & Coffee, các hàm xử lý đảm nhiệm các nhóm nghiệp vụ chính: xác thực người dùng, bán hàng tại quầy, đặt hàng online, quản lý ca làm việc, quản lý sản phẩm và kho, thống kê báo cáo, đánh giá và tra cứu hóa đơn.

**Vai trò của hàm xử lý:** tách biệt giao diện người dùng với quy tắc nghiệp vụ; đảm bảo mọi thao tác đều tuân thủ ràng buộc dữ liệu (trạng thái hóa đơn, tồn kho, quyền truy cập); giúp mô tả hệ thống theo cách gần với thực tế vận hành cửa hàng.

**Mô hình xử lý ba lớp áp dụng cho GongDek:**

| Lớp | Nhiệm vụ |
| --- | -------- |
| **Lớp giao diện** | Tiếp nhận thao tác người dùng (form đăng nhập, giỏ hàng, màn hình POS, quản trị), hiển thị kết quả và thông báo. |
| **Lớp xử lý** | Thực hiện các hàm nghiệp vụ được mô tả trong mục này: kiểm tra điều kiện, điều phối các bước xử lý. |
| **Lớp dữ liệu** | Lưu trữ và truy xuất thông tin trên cơ sở dữ liệu SQL Server (các bảng HoaDon, SanPham, NhanVien, v.v.). |

---

## 2.2.1. Danh sách các hàm xử lý

| STT | Tên hàm | Chức năng | Loại xử lý | Bảng dữ liệu liên quan |
| --- | ------- | --------- | ---------- | ---------------------- |
| 1 | DangNhap | Xác thực tài khoản và xác định vai trò người dùng | Xác thực | NhanVien, VaiTro, KhachHang |
| 2 | TaoDonHangOnline | Khách đã đăng nhập tạo đơn hàng giao tận nơi | Ghi dữ liệu | HoaDon, ChiTietHoaDon, ChiTietHoaDonTopping, DonHangOnline, KhachHang, SanPham, Size, Topping |
| 3 | ThemSanPhamVaoGioHang | Thêm món vào giỏ hàng trước khi đặt hàng | Xử lý tạm | SanPham, Size, Topping |
| 4 | TinhTongTienHoaDon | Tính tổng tiền hóa đơn từ chi tiết và điều chỉnh | Tính toán | HoaDon, ChiTietHoaDon, ChiTietHoaDonTopping |
| 5 | TaoHoaDon | Tạo hóa đơn bán tại quầy | Ghi dữ liệu | HoaDon, CaLamViec, NhanVien, KhachHang, Voucher |
| 6 | TaoChiTietHoaDon | Ghi từng dòng món trên hóa đơn | Ghi dữ liệu | ChiTietHoaDon, ChiTietHoaDonTopping, SanPham, Size, Topping |
| 7 | MoCaLamViec | Mở ca làm việc cho nhân viên | Ghi dữ liệu | CaLamViec, KhungCa, NhanVien |
| 8 | DongCaLamViec | Đóng ca và ghi nhận tiền mặt thực tế | Cập nhật | CaLamViec |
| 9 | ThemNhanVien | Tạo tài khoản nhân viên mới | Ghi dữ liệu | NhanVien, VaiTro |
| 10 | KhoaTaiKhoanNhanVien | Khóa tài khoản nhân viên, không xóa bản ghi | Cập nhật | NhanVien |
| 11 | ThemSanPham | Thêm sản phẩm mới vào danh mục bán | Ghi dữ liệu | SanPham, DanhMuc |
| 12 | CapNhatSanPham | Cập nhật thông tin và giá sản phẩm | Cập nhật | SanPham, DanhMuc |
| 13 | LapPhieuNhapKho | Lập phiếu nhập kho chờ duyệt | Ghi dữ liệu | PhieuNhapKho, ChiTietPhieuNhap, NguyenLieu, NhaCungCap |
| 14 | CapNhatSoLuongNguyenLieu | Cộng tồn kho khi duyệt phiếu nhập | Cập nhật | NguyenLieu, PhieuNhapKho, ChiTietPhieuNhap |
| 15 | ThongKeDoanhThu | Thống kê doanh thu theo khoảng thời gian | Thống kê | HoaDon |
| 16 | ThongKeTopSanPham | Thống kê sản phẩm bán chạy | Thống kê | ChiTietHoaDon, HoaDon, SanPham |
| 17 | XuatBaoCaoExcel | Xuất báo cáo doanh thu ra tệp Excel | Xuất báo cáo | HoaDon, NhanVien |
| 18 | XuatBaoCaoPDF | Xuất báo cáo doanh thu ra tệp PDF | Xuất báo cáo | HoaDon, NhanVien |
| 19 | TaoDanhGiaSanPham | Khách đánh giá sản phẩm sau khi mua | Ghi dữ liệu | DanhGia, HoaDon, SanPham, KhachHang, ChiTietHoaDon |
| 20 | TraCuuHoaDon | Tra cứu hóa đơn theo điều kiện | Tra cứu | HoaDon, ChiTietHoaDon, DonHangOnline, KhachHang |

---

### 2.2.2. Hàm DangNhap

#### Chức năng

Xác thực người dùng khi truy cập hệ thống. Phân biệt đăng nhập nhân viên (quản lý, nhân viên quầy) và khách hàng (đặt hàng online). Sau khi hợp lệ, hệ thống xác định vai trò để điều hướng chức năng phù hợp.

#### Dữ liệu vào

* tenDangNhap (tùy chọn, dùng cho nhân viên)
* email (tùy chọn, dùng cho khách hàng)
* matKhau

#### Dữ liệu ra

* Thông tin phiên đăng nhập (mã người dùng, họ tên, vai trò)
* Thông báo lỗi nếu sai tài khoản, sai mật khẩu hoặc tài khoản bị khóa

#### Bảng dữ liệu liên quan

* NhanVien
* VaiTro
* KhachHang

#### Thuật toán xử lý

```
DangNhap(tenDangNhap, email, matKhau)
{
    Kiểm tra matKhau đủ độ mạnh theo quy định hệ thống
    Nếu không hợp lệ
        Trả về thông báo lỗi mật khẩu

    Nếu tenDangNhap khác rỗng
        Mở bảng NhanVien
        Tìm bản ghi theo tenDangNhap
        Đọc thông tin VaiTro
        Đóng bảng NhanVien

        Nếu không tìm thấy
            Trả về thông báo đăng nhập sai

        Nếu TrangThai = Khoa
            Trả về thông báo tài khoản bị khóa

        So sánh matKhau với MatKhauHash đã lưu
        Nếu không khớp
            Trả về thông báo đăng nhập sai

        Trả về thông tin nhân viên và TenVaiTro (QuanLy hoặc NhanVien)
    Ngược lại Nếu email khác rỗng
        Mở bảng KhachHang
        Tìm bản ghi theo email
        Đóng bảng KhachHang

        Nếu không tìm thấy
            Trả về thông báo đăng nhập sai

        Nếu TrangThai khác HoatDong
            Trả về thông báo tài khoản không hoạt động

        So sánh matKhau với MatKhauHash đã lưu
        Nếu không khớp
            Trả về thông báo đăng nhập sai

        Trả về thông tin khách hàng và vai trò KhachHang
    Ngược lại
        Trả về thông báo yêu cầu nhập tên đăng nhập hoặc email
}
```

---

### 2.2.3. Hàm TaoDonHangOnline

#### Chức năng

Cho phép khách hàng đã đăng nhập gửi đơn đặt hàng online: tạo hóa đơn loại Online, ghi chi tiết món, tạo bản ghi giao hàng ở trạng thái chờ cửa hàng xác nhận.

#### Dữ liệu vào

* maKhachHang (lấy từ phiên đăng nhập khách, không do khách tự nhập)
* diaChiGiao
* ghiChuGiaoHang (tùy chọn)
* danhSachChiTiet: maSanPham, tenSize, soLuong, danhSachMaTopping, ghiChu

#### Dữ liệu ra

* maHoaDon vừa tạo
* trangThaiOnline = ChoXacNhan
* Thông báo lỗi nếu giỏ trống, thiếu địa chỉ hoặc sản phẩm không còn bán

#### Bảng dữ liệu liên quan

* HoaDon
* ChiTietHoaDon
* ChiTietHoaDonTopping
* DonHangOnline
* KhachHang
* SanPham
* Size
* Topping
* NhanVien

#### Thuật toán xử lý

```
TaoDonHangOnline(maKhachHang, diaChiGiao, ghiChuGiaoHang, danhSachChiTiet)
{
    Kiểm tra người dùng có vai trò KhachHang
    Nếu không
        Trả về thông báo không có quyền đặt hàng

    Nếu diaChiGiao rỗng
        Trả về thông báo thiếu địa chỉ giao

    Nếu danhSachChiTiet rỗng
        Trả về thông báo giỏ hàng trống

    Mở bảng KhachHang
    Đọc thông tin khách theo maKhachHang
    Nếu không tồn tại hoặc không HoatDong
        Trả về thông báo tài khoản không hợp lệ
    Đóng bảng KhachHang

    tongTienMon = 0
    Với mỗi dong trong danhSachChiTiet
        Đọc SanPham, kiểm tra TrangThai = DangBan
        Đọc Size theo tenSize, lấy PhuThu
        Đọc Topping, cộng DonGia từng topping
        donGiaDong = GiaBanGoc + PhuThu + tongTopping
        thanhTien = donGiaDong * soLuong
        tongTienMon = tongTienMon + thanhTien

    phiGiaoHang = 15000
    tongThanhToan = tongTienMon + phiGiaoHang

    Mở bảng HoaDon
    Ghi bản ghi mới: LoaiDon = Online, TrangThaiHoaDon = DaThanhToan,
        MaKH, TongTienMon, PhiGiaoHang, TongThanhToan, PhuongThucThanhToan = ChuyenKhoan
  Lấy maHoaDon vừa sinh
    Đóng bảng HoaDon

    Với mỗi dong trong danhSachChiTiet
        Gọi TaoChiTietHoaDon(maHoaDon, thông tin dong)

    Mở bảng DonHangOnline
    Ghi: maHoaDon, hoTenNhan, soDienThoaiNhan, diaChiGiao,
        ghiChuGiaoHang, TrangThaiOnline = ChoXacNhan
    Đóng bảng DonHangOnline

    Trả về maHoaDon và ChoXacNhan
}
```

---

### 2.2.4. Hàm ThemSanPhamVaoGioHang

#### Chức năng

Thêm một món (sản phẩm kèm size, topping, số lượng) vào giỏ hàng tạm của khách trước khi thực hiện đặt hàng. Khách chưa đăng nhập vẫn có thể thêm món; đăng nhập chỉ bắt buộc khi xác nhận đặt hàng.

#### Dữ liệu vào

* maSanPham
* tenSize
* soLuong
* danhSachMaTopping (tùy chọn)
* ghiChu (tùy chọn)

#### Dữ liệu ra

* Giỏ hàng đã cập nhật (danh sách món, số lượng dòng)
* Thông báo nếu sản phẩm ngừng bán hoặc size không hợp lệ

#### Bảng dữ liệu liên quan

* SanPham
* Size
* Topping

#### Thuật toán xử lý

```
ThemSanPhamVaoGioHang(maSanPham, tenSize, soLuong, danhSachMaTopping, ghiChu)
{
    Nếu soLuong < 1
        Trả về thông báo số lượng không hợp lệ

    Mở bảng SanPham
    Đọc sản phẩm theo maSanPham
    Nếu không tồn tại hoặc TrangThai khác DangBan
        Trả về thông báo sản phẩm không khả dụng
    Đóng bảng SanPham

    Mở bảng Size
    Tìm size theo tenSize và TrangThai = DangApDung
    Nếu không tìm thấy
        Trả về thông báo size không hợp lệ
    Đóng bảng Size

    tongTopping = 0
    Mở bảng Topping
    Với mỗi maTopping trong danhSachMaTopping
        Đọc topping, kiểm tra DangBan
        tongTopping = tongTopping + DonGia
    Đóng bảng Topping

    donGiaMotPhan = GiaBanGoc + PhuThuSize + tongTopping
    thanhTienDong = donGiaMotPhan * soLuong

    Thêm dòng mới vào cấu trúc giỏ hàng tạm (phiên làm việc)
    Trả về giỏ hàng đã cập nhật
}
```

---

### 2.2.5. Hàm TinhTongTienHoaDon

#### Chức năng

Tính tổng tiền phải thanh toán của một hóa đơn dựa trên các dòng chi tiết, phụ thu size, topping, phí giao hàng và tiền giảm giá.

#### Dữ liệu vào

* maHoaDon

#### Dữ liệu ra

* tongTienMon
* tienGiamGia
* phiGiaoHang
* tongThanhToan

#### Bảng dữ liệu liên quan

* HoaDon
* ChiTietHoaDon
* ChiTietHoaDonTopping

#### Thuật toán xử lý

```
TinhTongTienHoaDon(maHoaDon)
{
    Mở bảng ChiTietHoaDon
    Tìm danh sách chi tiết theo maHoaDon

    Nếu không tồn tại chi tiết
        tongTienMon = 0
    Ngược lại
        tongTienMon = 0
        Với mỗi chiTiet
            Đọc ChiTietHoaDonTopping theo maChiTiet
            thanhTien = SoLuong * (DonGiaGoc + PhuThuSize + tổng DonGiaTopping)
            tongTienMon = tongTienMon + thanhTien
    Đóng bảng ChiTietHoaDon

    Mở bảng HoaDon
    Đọc PhiGiaoHang, TienGiamGia, DiemSuDung
    tongThanhToan = tongTienMon + PhiGiaoHang - TienGiamGia - (quy đổi điểm nếu có)
    Kiểm tra tongThanhToan >= 0 theo ràng buộc nghiệp vụ
    Ghi lại TongTienMon, TongThanhToan vào HoaDon
    Đóng bảng HoaDon

    Trả về tongTienMon, tienGiamGia, phiGiaoHang, tongThanhToan
}
```

---

### 2.2.6. Hàm TaoHoaDon

#### Chức năng

Tạo hóa đơn bán hàng tại quầy (POS): ghi thông tin chung của đơn, gắn nhân viên lập, ca làm việc, khách hàng và voucher (nếu có), trạng thái ban đầu chờ thanh toán.

#### Dữ liệu vào

* maNVLap
* maCa (ca đang mở)
* maKH (tùy chọn)
* maVoucher (tùy chọn)
* loaiDon = TaiQuay

#### Dữ liệu ra

* maHoaDon mới
* trangThaiHoaDon = ChoThanhToan
* Thông báo lỗi nếu ca chưa mở hoặc voucher không hợp lệ

#### Bảng dữ liệu liên quan

* HoaDon
* CaLamViec
* NhanVien
* KhachHang
* Voucher

#### Thuật toán xử lý

```
TaoHoaDon(maNVLap, maCa, maKH, maVoucher)
{
    Mở bảng CaLamViec
    Đọc ca theo maCa
    Nếu TrangThaiCa khác DangMo
        Trả về thông báo ca không hợp lệ
    Đóng bảng CaLamViec

    Mở bảng NhanVien
    Kiểm tra maNVLap tồn tại và HoatDong
    Đóng bảng NhanVien

    tienGiamGia = 0
    Nếu maVoucher khác null
        Mở bảng Voucher
        Kiểm tra còn hiệu lực, đủ điều kiện đơn tối thiểu
        Tính tienGiamGia
        Đóng bảng Voucher

    Mở bảng HoaDon
    Ghi bản ghi: LoaiDon = TaiQuay, TrangThaiHoaDon = ChoThanhToan,
        MaNVLap, MaCa, MaKH, TienGiamGia, ThoiGianLap = hiện tại
    Lấy maHoaDon
    Đóng bảng HoaDon

    Trả về maHoaDon
}
```

---

### 2.2.7. Hàm TaoChiTietHoaDon

#### Chức năng

Ghi một dòng món trên hóa đơn: sản phẩm, size, số lượng, đơn giá, thành tiền và danh sách topping kèm theo.

#### Dữ liệu vào

* maHoaDon
* maSanPham
* maSize
* soLuong
* danhSachMaTopping (tùy chọn)
* ghiChu (tùy chọn)

#### Dữ liệu ra

* maChiTiet vừa tạo
* thanhTien của dòng
* Thông báo lỗi nếu sản phẩm hoặc topping không hợp lệ

#### Bảng dữ liệu liên quan

* ChiTietHoaDon
* ChiTietHoaDonTopping
* SanPham
* Size
* Topping

#### Thuật toán xử lý

```
TaoChiTietHoaDon(maHoaDon, maSanPham, maSize, soLuong, danhSachMaTopping, ghiChu)
{
    Mở bảng SanPham
    Đọc GiaBanGoc, kiểm tra DangBan
    Đóng bảng SanPham

    Mở bảng Size
    Đọc PhuThu theo maSize
    Đóng bảng Size

    Mở bảng ChiTietHoaDon
    thanhTien = soLuong * (DonGiaGoc + PhuThuSize)
    Ghi dòng chi tiết: maHoaDon, maSanPham, maSize, soLuong,
        DonGiaGoc, PhuThuSize, thanhTien, ghiChu
    Lấy maChiTiet
    Đóng bảng ChiTietHoaDon

    Mở bảng ChiTietHoaDonTopping
    Với mỗi maTopping trong danhSachMaTopping
        Đọc DonGia từ Topping
        Ghi: maChiTiet, maTopping, DonGiaTopping, SoLuong = 1
        thanhTien = thanhTien + soLuong * DonGiaTopping
    Cập nhật ThanhTien trên ChiTietHoaDon
    Đóng bảng ChiTietHoaDonTopping

    Gọi TinhTongTienHoaDon(maHoaDon)

    Trả về maChiTiet và thanhTien
}
```

---

### 2.2.8. Hàm MoCaLamViec

#### Chức năng

Mở ca làm việc cho nhân viên: ghi ngày làm, khung ca, thời gian mở ca và tiền quỹ đầu ca.

#### Dữ liệu vào

* maNhanVien
* maKhungCa
* tienQuyDauCa
* ngayLam (tùy chọn, mặc định ngày hiện tại)
* ghiChu (tùy chọn)

#### Dữ liệu ra

* maCa của ca vừa mở
* trangThaiCa = DangMo
* Thông báo lỗi nếu nhân viên đang có ca chưa đóng

#### Bảng dữ liệu liên quan

* CaLamViec
* KhungCa
* NhanVien

#### Thuật toán xử lý

```
MoCaLamViec(maNhanVien, maKhungCa, tienQuyDauCa, ngayLam, ghiChu)
{
    Mở bảng KhungCa
    Đọc khung ca theo maKhungCa
    Nếu TrangThai khác HoatDong
        Trả về thông báo khung ca không hoạt động
    Đóng bảng KhungCa

    Mở bảng NhanVien
    Kiểm tra nhân viên HoatDong
    Đóng bảng NhanVien

    Mở bảng CaLamViec
    Tìm ca DangMo của maNhanVien
    Nếu đã tồn tại
        Trả về thông báo phải đóng ca trước

    Ghi ca mới: maKhungCa, maNhanVien, ngayLam, ThoiGianMo = hiện tại,
        tienQuyDauCa, TrangThaiCa = DangMo, ghiChu
    Lấy maCa
    Đóng bảng CaLamViec

    Trả về maCa
}
```

---

### 2.2.9. Hàm DongCaLamViec

#### Chức năng

Đóng ca làm việc: ghi thời gian đóng, tiền mặt thực tế cuối ca để đối chiếu với doanh thu và quỹ đầu ca.

#### Dữ liệu vào

* maCa
* tienMatThucTe
* ghiChu (tùy chọn)

#### Dữ liệu ra

* Ca đã đóng (TrangThaiCa = DaDong)
* Thông báo lỗi nếu ca không ở trạng thái đang mở

#### Bảng dữ liệu liên quan

* CaLamViec

#### Thuật toán xử lý

```
DongCaLamViec(maCa, tienMatThucTe, ghiChu)
{
    Mở bảng CaLamViec
    Đọc ca theo maCa

    Nếu không tồn tại
        Trả về thông báo không tìm thấy ca

    Nếu TrangThaiCa khác DangMo
        Trả về thông báo ca đã đóng

    Ghi ThoiGianDong = hiện tại
    Ghi tienMatThucTe
    Ghi TrangThaiCa = DaDong
    Nếu ghiChu khác rỗng
        Nối ghiChu vào trường GhiChu ca

    Đóng bảng CaLamViec

    Trả về thông tin ca đã đóng
}
```

---

### 2.2.10. Hàm ThemNhanVien

#### Chức năng

Quản lý tạo tài khoản nhân viên mới: ghi thông tin cá nhân, tên đăng nhập, mật khẩu đã mã hóa và vai trò (QuanLy hoặc NhanVien).

#### Dữ liệu vào

* hoTen
* tenDangNhap
* matKhau
* maVaiTro
* soDienThoai, ngaySinh, gioiTinh, diaChi (tùy chọn)

#### Dữ liệu ra

* maNhanVien mới
* Thông báo lỗi nếu trùng tên đăng nhập hoặc mật khẩu yếu

#### Bảng dữ liệu liên quan

* NhanVien
* VaiTro

#### Thuật toán xử lý

```
ThemNhanVien(hoTen, tenDangNhap, matKhau, maVaiTro, ...)
{
    Kiểm tra matKhau đủ độ mạnh

    Mở bảng VaiTro
    Đọc vai trò theo maVaiTro
    Nếu TenVaiTro không thuộc {QuanLy, NhanVien}
        Trả về thông báo vai trò không hợp lệ
    Đóng bảng VaiTro

    Mở bảng NhanVien
    Nếu tenDangNhap đã tồn tại
        Trả về thông báo trùng tên đăng nhập

    maHoaMatKhau = MaHoa(matKhau)
    Ghi bản ghi: hoTen, tenDangNhap, MatKhauHash, maVaiTro,
        TrangThai = HoatDong, NgayTao = hiện tại
    Lấy maNhanVien
    Đóng bảng NhanVien

    Trả về maNhanVien
}
```

---

### 2.2.11. Hàm KhoaTaiKhoanNhanVien

#### Chức năng

Khóa tài khoản nhân viên khi nghỉ việc hoặc vi phạm: chỉ đổi trạng thái, không xóa dữ liệu lịch sử ca và hóa đơn.

#### Dữ liệu vào

* maNhanVien

#### Dữ liệu ra

* TrangThai = Khoa
* Thông báo nếu tài khoản đã bị khóa trước đó

#### Bảng dữ liệu liên quan

* NhanVien

#### Thuật toán xử lý

```
KhoaTaiKhoanNhanVien(maNhanVien)
{
    Mở bảng NhanVien
    Đọc nhân viên theo maNhanVien

    Nếu không tồn tại
        Trả về thông báo không tìm thấy

    Nếu TrangThai = Khoa
        Trả về thông báo đã khóa

    Ghi TrangThai = Khoa
    Đóng bảng NhanVien

    Trả về xác nhận khóa thành công
}
```

---

### 2.2.12. Hàm ThemSanPham

#### Chức năng

Thêm sản phẩm mới vào danh mục bán của cửa hàng: tên, mô tả, giá gốc, danh mục, hình ảnh và trạng thái.

#### Dữ liệu vào

* tenSanPham
* maDanhMuc
* giaBanGoc
* moTa (tùy chọn)
* hinhAnh (tùy chọn)
* trangThai (mặc định DangBan)

#### Dữ liệu ra

* maSanPham mới
* Thông báo lỗi nếu danh mục không tồn tại

#### Bảng dữ liệu liên quan

* SanPham
* DanhMuc

#### Thuật toán xử lý

```
ThemSanPham(tenSanPham, maDanhMuc, giaBanGoc, moTa, hinhAnh, trangThai)
{
    Mở bảng DanhMuc
    Kiểm tra maDanhMuc tồn tại và HienThi
    Đóng bảng DanhMuc

    Nếu giaBanGoc < 0
        Trả về thông báo giá không hợp lệ

    Mở bảng SanPham
    Ghi bản ghi mới với các thông tin trên
    Lấy maSanPham
    Đóng bảng SanPham

    Trả về maSanPham
}
```

---

### 2.2.13. Hàm CapNhatSanPham

#### Chức năng

Cập nhật thông tin sản phẩm đã có: tên, giá, mô tả, danh mục, hình ảnh hoặc chuyển trạng thái ngừng bán.

#### Dữ liệu vào

* maSanPham
* tenSanPham, maDanhMuc, giaBanGoc, moTa, hinhAnh, trangThai

#### Dữ liệu ra

* Thông tin sản phẩm sau cập nhật
* Thông báo nếu không tìm thấy sản phẩm

#### Bảng dữ liệu liên quan

* SanPham
* DanhMuc

#### Thuật toán xử lý

```
CapNhatSanPham(maSanPham, tenSanPham, maDanhMuc, giaBanGoc, moTa, hinhAnh, trangThai)
{
    Mở bảng SanPham
    Tìm bản ghi theo maSanPham
    Nếu không tồn tại
        Trả về thông báo không tìm thấy

    Kiểm tra maDanhMuc hợp lệ trên bảng DanhMuc
    Cập nhật các trường thông tin
    Đóng bảng SanPham

    Trả về sản phẩm đã cập nhật
}
```

---

### 2.2.14. Hàm LapPhieuNhapKho

#### Chức năng

Lập phiếu nhập kho nguyên liệu ở trạng thái chờ duyệt: ghi nhà cung cấp, người lập, ngày nhập và danh sách dòng nhập.

#### Dữ liệu vào

* maNCC
* maNVLap
* ngayNhap
* danhSachChiTiet: maNL, soLuongNhap, donGiaNhap
* ghiChu (tùy chọn)

#### Dữ liệu ra

* maPhieuNhap
* trangThaiPhieu = ChoDuyet
* tongTienNhap

#### Bảng dữ liệu liên quan

* PhieuNhapKho
* ChiTietPhieuNhap
* NguyenLieu
* NhaCungCap
* NhanVien

#### Thuật toán xử lý

```
LapPhieuNhapKho(maNCC, maNVLap, ngayNhap, danhSachChiTiet, ghiChu)
{
    Kiểm tra maNCC, maNVLap tồn tại

    tongTienNhap = 0
    Với mỗi dong trong danhSachChiTiet
        thanhTien = soLuongNhap * donGiaNhap
        tongTienNhap = tongTienNhap + thanhTien

    Mở bảng PhieuNhapKho
    Ghi phiếu: maNCC, maNVLap, ngayNhap, tongTienNhap,
        TrangThaiPhieu = ChoDuyet, ghiChu
    Lấy maPhieuNhap
    Đóng bảng PhieuNhapKho

    Mở bảng ChiTietPhieuNhap
    Với mỗi dong trong danhSachChiTiet
        Ghi: maPhieuNhap, maNL, soLuongNhap, donGiaNhap, thanhTien
    Đóng bảng ChiTietPhieuNhap

    Trả về maPhieuNhap và ChoDuyet
}
```

---

### 2.2.15. Hàm CapNhatSoLuongNguyenLieu

#### Chức năng

Khi phiếu nhập được duyệt, cộng số lượng tồn kho tương ứng cho từng nguyên liệu trên phiếu.

#### Dữ liệu vào

* maPhieuNhap
* maNVDuyet

#### Dữ liệu ra

* Phiếu trạng thái DaDuyet
* Danh sách nguyên liệu đã cập nhật tồn
* Thông báo lỗi nếu phiếu không ở trạng thái ChoDuyet

#### Bảng dữ liệu liên quan

* PhieuNhapKho
* ChiTietPhieuNhap
* NguyenLieu
* NhanVien

#### Thuật toán xử lý

```
CapNhatSoLuongNguyenLieu(maPhieuNhap, maNVDuyet)
{
    Mở bảng PhieuNhapKho
    Đọc phiếu theo maPhieuNhap

    Nếu TrangThaiPhieu khác ChoDuyet
        Trả về thông báo không thể duyệt

    Mở bảng ChiTietPhieuNhap
    Đọc tất cả dòng theo maPhieuNhap

    Với mỗi chiTiet
        Mở bảng NguyenLieu
        Đọc SoLuongTon theo maNL
        SoLuongTon = SoLuongTon + SoLuongNhap
        Ghi lại NguyenLieu
        Đóng bảng NguyenLieu

    Đóng bảng ChiTietPhieuNhap

    Ghi PhieuNhapKho: maNVDuyet, NgayDuyet = hiện tại, TrangThaiPhieu = DaDuyet
    Đóng bảng PhieuNhapKho

    Trả về xác nhận duyệt thành công
}
```

---

### 2.2.16. Hàm ThongKeDoanhThu

#### Chức năng

Tổng hợp doanh thu và số hóa đơn trong khoảng thời gian chỉ định, phục vụ dashboard và báo cáo quản lý.

#### Dữ liệu vào

* tuNgay
* denNgay

#### Dữ liệu ra

* tongDoanhThu
* soHoaDon
* (tùy yêu cầu) danh sách chi tiết từng hóa đơn trong kỳ

#### Bảng dữ liệu liên quan

* HoaDon

#### Thuật toán xử lý

```
ThongKeDoanhThu(tuNgay, denNgay)
{
    Nếu tuNgay > denNgay
        Trả về thông báo khoảng ngày không hợp lệ

    Mở bảng HoaDon
    Lọc hóa đơn có ThoiGianLap trong [tuNgay, denNgay]
    Lọc TrangThaiHoaDon thuộc các trạng thái đã thanh toán hoặc hoàn thành

    tongDoanhThu = 0
    soHoaDon = 0
    Với mỗi hoaDon thỏa điều kiện
        tongDoanhThu = tongDoanhThu + TongThanhToan
        soHoaDon = soHoaDon + 1

    Đóng bảng HoaDon

    Trả về tongDoanhThu, soHoaDon
}
```

---

### 2.2.17. Hàm ThongKeTopSanPham

#### Chức năng

Xác định các sản phẩm bán chạy nhất trong kỳ dựa trên tổng số lượng đã bán trên các hóa đơn hợp lệ.

#### Dữ liệu vào

* tuNgay
* denNgay
* soDongToiDa (giới hạn số sản phẩm trả về)

#### Dữ liệu ra

* Danh sách (tenSanPham, tongSoLuongBan) sắp xếp giảm dần

#### Bảng dữ liệu liên quan

* ChiTietHoaDon
* HoaDon
* SanPham

#### Thuật toán xử lý

```
ThongKeTopSanPham(tuNgay, denNgay, soDongToiDa)
{
    Mở bảng ChiTietHoaDon
    Nối với HoaDon theo maHoaDon
    Lọc ThoiGianLap trong [tuNgay, denNgay]
    Lọc TrangThaiHoaDon hợp lệ

    Nhóm theo maSanPham, tenSanPham
    Tính tongSoLuong = SUM(SoLuong)
    Sắp xếp tongSoLuong giảm dần
    Lấy soDongToiDa dòng đầu

    Đóng bảng ChiTietHoaDon

    Trả về danh sách top sản phẩm
}
```

---

### 2.2.18. Hàm XuatBaoCaoExcel

#### Chức năng

Xuất báo cáo doanh thu chi tiết ra tệp Excel để quản lý lưu trữ, in ấn hoặc gửi báo cáo định kỳ.

#### Dữ liệu vào

* tuNgay
* denNgay

#### Dữ liệu ra

* Tệp Excel chứa phần tổng hợp và bảng chi tiết hóa đơn
* Thông báo lỗi nếu không có dữ liệu trong kỳ

#### Bảng dữ liệu liên quan

* HoaDon
* NhanVien

#### Thuật toán xử lý

```
XuatBaoCaoExcel(tuNgay, denNgay)
{
    goi ThongKeDoanhThu(tuNgay, denNgay)
    Đọc danh sách chi tiết hóa đơn trong kỳ từ bảng HoaDon

    Tạo cấu trúc báo cáo:
        Tiêu đề cửa hàng, khoảng ngày, ngày xuất
        Dòng tổng: tổng doanh thu, số hóa đơn, tiền mặt, chuyển khoản, ví điện tử
        Bảng chi tiết: mã HĐ, thời gian, nhân viên, loại đơn, phương thức TT, tổng tiền

    Ghi nội dung ra tệp định dạng Excel
    Trả về tệp cho lớp giao diện tải xuống
}
```

---

### 2.2.19. Hàm XuatBaoCaoPDF

#### Chức năng

Xuất cùng nội dung báo cáo doanh thu ra tệp PDF phục vụ in ấn và lưu hồ sơ.

#### Dữ liệu vào

* tuNgay
* denNgay

#### Dữ liệu ra

* Tệp PDF báo cáo doanh thu

#### Bảng dữ liệu liên quan

* HoaDon
* NhanVien

#### Thuật toán xử lý

```
XuatBaoCaoPDF(tuNgay, denNgay)
{
    goi ThongKeDoanhThu(tuNgay, denNgay)
    Đọc danh sách chi tiết hóa đơn trong kỳ

    Dựng bố cục PDF:
        Header thông tin cửa hàng GongDek
        Bảng tổng hợp kỳ báo cáo
        Bảng liệt kê từng hóa đơn

    Sinh tệp PDF
    Trả về tệp cho người dùng tải hoặc in
}
```

---

### 2.2.20. Hàm TaoDanhGiaSanPham

#### Chức năng

Cho phép khách hàng đánh giá sản phẩm đã mua: điểm sao và nội dung nhận xét, gắn với hóa đơn đã hoàn thành.

#### Dữ liệu vào

* maHoaDon
* maSanPham
* maKhachHang (từ phiên đăng nhập)
* soSao (1 đến 5)
* noiDung (tùy chọn)

#### Dữ liệu ra

* maDanhGia mới
* Thông báo lỗi nếu hóa đơn chưa hoàn thành hoặc sản phẩm không thuộc hóa đơn

#### Bảng dữ liệu liên quan

* DanhGia
* HoaDon
* ChiTietHoaDon
* SanPham
* KhachHang

#### Thuật toán xử lý

```
TaoDanhGiaSanPham(maHoaDon, maSanPham, maKhachHang, soSao, noiDung)
{
    Nếu soSao < 1 hoặc soSao > 5
        Trả về thông báo điểm sao không hợp lệ

    Mở bảng HoaDon
    Đọc hóa đơn theo maHoaDon
    Nếu MaKH khác maKhachHang
        Trả về thông báo không có quyền đánh giá
    Nếu TrangThaiHoaDon khác HoanThanh
        Trả về thông báo chưa thể đánh giá
    Đóng bảng HoaDon

    Mở bảng ChiTietHoaDon
    Kiểm tra tồn tại dòng maSanPham trên maHoaDon
    Nếu không
        Trả về thông báo sản phẩm không thuộc đơn
    Đóng bảng ChiTietHoaDon

    Mở bảng DanhGia
    Kiểm tra chưa đánh giá trùng (maHoaDon, maSanPham, maKhachHang)
    Ghi: maHoaDon, maSanPham, maKhachHang, soSao, noiDung, NgayDanhGia = hiện tại
    Lấy maDanhGia
    Đóng bảng DanhGia

    Trả về maDanhGia
}
```

---

### 2.2.21. Hàm TraCuuHoaDon

#### Chức năng

Tra cứu hóa đơn theo một hoặc nhiều tiêu chí: mã hóa đơn, khoảng ngày, loại đơn, trạng thái, khách hàng — phục vụ quản lý, nhân viên và khách xem lịch sử mua.

#### Dữ liệu vào

* maHoaDon (tùy chọn)
* tuNgay, denNgay (tùy chọn)
* loaiDon (tùy chọn)
* trangThaiHoaDon (tùy chọn)
* maKhachHang (tùy chọn)

#### Dữ liệu ra

* Danh sách hóa đơn thỏa điều kiện
* Chi tiết một hóa đơn (khi tra theo mã)
* Thông báo nếu không có kết quả

#### Bảng dữ liệu liên quan

* HoaDon
* ChiTietHoaDon
* ChiTietHoaDonTopping
* DonHangOnline
* KhachHang
* NhanVien

#### Thuật toán xử lý

```
TraCuuHoaDon(maHoaDon, tuNgay, denNgay, loaiDon, trangThaiHoaDon, maKhachHang)
{
    Mở bảng HoaDon

    Nếu maHoaDon khác null
        Đọc một bản ghi theo maHoaDon
        Đọc ChiTietHoaDon, DonHangOnline (nếu Online)
        Đóng bảng HoaDon
        Trả về chi tiết hóa đơn

    Xây dựng điều kiện lọc:
        Nếu tuNgay, denNgay có giá trị → lọc ThoiGianLap
        Nếu loaiDon có giá trị → lọc LoaiDon
        Nếu trangThaiHoaDon có giá trị → lọc trạng thái
        Nếu maKhachHang có giá trị → lọc MaKH

    Đọc danh sách hóa đơn thỏa điều kiện
    Sắp xếp theo ThoiGianLap giảm dần
    Đóng bảng HoaDon

    Trả về danh sách kết quả
}
```

---

## Kết luận

Các hàm xử lý trên được thiết kế bám sát quy trình vận hành cửa hàng GongDek Tea & Coffee: từ đăng nhập, bán hàng tại quầy, đặt hàng online, quản lý nhân sự và ca làm việc, quản lý sản phẩm và kho, đến thống kê báo cáo, đánh giá và tra cứu hóa đơn. Mỗi hàm được mô tả rõ chức năng, dữ liệu vào/ra, bảng liên quan và thuật toán xử lý theo phong cách giáo trình Công nghệ phần mềm.

Hệ thống áp dụng **mô hình ba lớp**: lớp giao diện thu thập và hiển thị; lớp xử lý thực hiện các hàm nghiệp vụ; lớp dữ liệu đảm bảo lưu trữ nhất quán. Cách phân lớp giúp **dễ bảo trì** (sửa quy tắc nghiệp vụ tập trung ở lớp xử lý) và **dễ mở rộng** (bổ sung hàm mới cho voucher, hoàn đơn, workflow đơn online mà không làm rối giao diện).

Tập hàm trong mục 2.2 đáp ứng các yêu cầu nghiệp vụ cốt lõi đã xác định cho đồ án nhóm; các hàm chưa triển khai đầy đủ trên hệ thống thực tế vẫn được mô tả ở mức thiết kế để làm cơ sở triển khai và kiểm thử trong các giai đoạn tiếp theo của dự án.
