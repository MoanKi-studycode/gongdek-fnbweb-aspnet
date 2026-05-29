-- Chay sau seed.sql: danh muc 31 mon, voucher, khach hang, don hang mau (01/2026 - 05/2026)
USE [GongDekDB];
GO
SET NOCOUNT ON;

-- ========== DANH MUC ==========
IF NOT EXISTS (SELECT 1 FROM dbo.DanhMuc WHERE TenDanhMuc = N'Cà Phê')
    INSERT dbo.DanhMuc (TenDanhMuc, MoTa, ThuTuHienThi, TrangThai) VALUES (N'Cà Phê', N'Cà phê phin & espresso GongDek', 1, N'HienThi');
IF NOT EXISTS (SELECT 1 FROM dbo.DanhMuc WHERE TenDanhMuc = N'Đá xay')
    INSERT dbo.DanhMuc (TenDanhMuc, MoTa, ThuTuHienThi, TrangThai) VALUES (N'Đá xay', N'Đá xay mát lạnh', 2, N'HienThi');
IF NOT EXISTS (SELECT 1 FROM dbo.DanhMuc WHERE TenDanhMuc = N'Soda')
    INSERT dbo.DanhMuc (TenDanhMuc, MoTa, ThuTuHienThi, TrangThai) VALUES (N'Soda', N'Soda tươi mát', 3, N'HienThi');
IF NOT EXISTS (SELECT 1 FROM dbo.DanhMuc WHERE TenDanhMuc = N'Trà')
    INSERT dbo.DanhMuc (TenDanhMuc, MoTa, ThuTuHienThi, TrangThai) VALUES (N'Trà', N'Trà trái cây tươi', 4, N'HienThi');
IF NOT EXISTS (SELECT 1 FROM dbo.DanhMuc WHERE TenDanhMuc = N'Trà sữa')
    INSERT dbo.DanhMuc (TenDanhMuc, MoTa, ThuTuHienThi, TrangThai) VALUES (N'Trà sữa', N'Trà sữa GongDek', 5, N'HienThi');
GO

DECLARE @DM_CP INT = (SELECT MaDanhMuc FROM dbo.DanhMuc WHERE TenDanhMuc = N'Cà Phê');
DECLARE @DM_DX INT = (SELECT MaDanhMuc FROM dbo.DanhMuc WHERE TenDanhMuc = N'Đá xay');
DECLARE @DM_SD INT = (SELECT MaDanhMuc FROM dbo.DanhMuc WHERE TenDanhMuc = N'Soda');
DECLARE @DM_TR INT = (SELECT MaDanhMuc FROM dbo.DanhMuc WHERE TenDanhMuc = N'Trà');
DECLARE @DM_TS INT = (SELECT MaDanhMuc FROM dbo.DanhMuc WHERE TenDanhMuc = N'Trà sữa');

-- San pham + hinh anh (file trong /images/products/)
DECLARE @SP TABLE (Ten NVARCHAR(150), MaDM INT, Gia DECIMAL(18,2), Anh NVARCHAR(200));
INSERT @SP (Ten, MaDM, Gia, Anh) VALUES
(N'Bạc Sỉu', @DM_CP, 35000, N'/images/products/bac-xiu.png'),
(N'Cà Phê đen', @DM_CP, 29000, N'/images/products/ca-phe-den.png'),
(N'Cà Phê sữa', @DM_CP, 32000, N'/images/products/ca-phe-sua.png'),
(N'Cà Phê cốt dừa', @DM_CP, 39000, N'/images/products/ca-phe-cot-dua.png'),
(N'Cà phê trứng', @DM_CP, 42000, N'/images/products/ca-phe-trung.png'),
(N'Cà phê muối', @DM_CP, 40000, N'/images/products/ca-phe-muoi.png'),
(N'Cà phê đá xay', @DM_DX, 48000, N'/images/products/ca-phe-da-xay.png'),
(N'Caramel đá xay', @DM_DX, 52000, N'/images/products/caramel-da-xay.png'),
(N'Cookie đá xay', @DM_DX, 50000, N'/images/products/cookie-da-xay.png'),
(N'Khoai môn đá xay', @DM_DX, 49000, N'/images/products/khoai-mon-da-xay.png'),
(N'Matcha đá xay', @DM_DX, 51000, N'/images/products/matcha-da-xay.png'),
(N'Việt quất đá xay', @DM_DX, 53000, N'/images/products/viet-quat-da-xay.jpg'),
(N'Xoài nhiệt đới đá xay', @DM_DX, 54000, N'/images/products/xoai-nhiet-doi-da-xay.png'),
(N'Soda blue ocean', @DM_SD, 42000, N'/images/products/soda-blue-ocean.jpg'),
(N'Soda chanh dây', @DM_SD, 40000, N'/images/products/soda-chanh-day.jpg'),
(N'Soda dâu tằm', @DM_SD, 41000, N'/images/products/soda-dau-tam.jpg'),
(N'Soda dâu tây bạc hà', @DM_SD, 43000, N'/images/products/soda-dau-tay-bac-ha.jpg'),
(N'Soda việt quất', @DM_SD, 42000, N'/images/products/soda-viet-quat.jpg'),
(N'Trà đào cam sả', @DM_TR, 39000, N'/images/products/tra-dao-cam-sa.jpg'),
(N'Trà dâu tằm', @DM_TR, 38000, N'/images/products/tra-dau-tam.jpg'),
(N'Trà hoa cúc mật ong', @DM_TR, 36000, N'/images/products/tra-hoa-cuc-mat-ong.jpg'),
(N'Trà măng cụt', @DM_TR, 40000, N'/images/products/tra-mang-cut.jpg'),
(N'Trà ổi hồng chanh dây', @DM_TR, 41000, N'/images/products/tra-oi-hong-chanh-day.jpg'),
(N'Trà thanh long đỏ', @DM_TR, 39000, N'/images/products/tra-thanh-long-do.jpg'),
(N'Trà vải hoa lài', @DM_TR, 42000, N'/images/products/tra-vai-hoa-lai.jpg'),
(N'Trà sữa truyền thống', @DM_TS, 35000, N'/images/products/tra-sua-truyen-thong.jpg'),
(N'Trà sữa khoai môn', @DM_TS, 42000, N'/images/products/tra-sua-khoai-mon.jpg'),
(N'Trà sữa matcha', @DM_TS, 45000, N'/images/products/tra-sua-matcha.jpg'),
(N'Trà sữa nướng', @DM_TS, 48000, N'/images/products/tra-sua-nuong.jpg'),
(N'Trà sữa thái đỏ', @DM_TS, 40000, N'/images/products/tra-sua-thai-do.jpg'),
(N'Trà sữa thái xanh', @DM_TS, 40000, N'/images/products/tra-sua-thai-xanh.jpg');

INSERT dbo.SanPham (MaDanhMuc, TenSanPham, MoTa, GiaBanGoc, HinhAnh, TrangThai)
SELECT s.MaDM, s.Ten, N'Món GongDek - ' + s.Ten, s.Gia, s.Anh, N'DangBan'
FROM @SP s
WHERE NOT EXISTS (SELECT 1 FROM dbo.SanPham p WHERE p.TenSanPham = s.Ten);

UPDATE p SET p.HinhAnh = s.Anh, p.MaDanhMuc = s.MaDM, p.GiaBanGoc = s.Gia
FROM dbo.SanPham p INNER JOIN @SP s ON p.TenSanPham = s.Ten;
GO

-- ========== VOUCHER ==========
IF NOT EXISTS (SELECT 1 FROM dbo.Voucher WHERE MaCode = N'GONGDEK10')
    INSERT dbo.Voucher (MaCode, MoTa, GiaTriGiam, DonHangToiThieu, NgayBatDau, NgayKetThuc, TrangThai)
    VALUES (N'GONGDEK10', N'PHAN_TRAM | Giảm 10% đơn từ 50k | GIAM_TOI_DA:30000', 10, 50000, '2026-01-01', '2026-12-31', N'ConHieuLuc');
IF NOT EXISTS (SELECT 1 FROM dbo.Voucher WHERE MaCode = N'GIAM15K')
    INSERT dbo.Voucher (MaCode, MoTa, GiaTriGiam, DonHangToiThieu, NgayBatDau, NgayKetThuc, TrangThai)
    VALUES (N'GIAM15K', N'SO_TIEN | Giảm 15.000đ đơn từ 80k', 15000, 80000, '2026-01-01', '2026-12-31', N'ConHieuLuc');
IF NOT EXISTS (SELECT 1 FROM dbo.Voucher WHERE MaCode = N'TET2026')
    INSERT dbo.Voucher (MaCode, MoTa, GiaTriGiam, DonHangToiThieu, NgayBatDau, NgayKetThuc, TrangThai)
    VALUES (N'TET2026', N'PHAN_TRAM | Tết 2026 giảm 20% | GIAM_TOI_DA:50000', 20, 100000, '2026-01-01', '2026-02-15', N'ConHieuLuc');
IF NOT EXISTS (SELECT 1 FROM dbo.Voucher WHERE MaCode = N'COMBO50')
    INSERT dbo.Voucher (MaCode, MoTa, GiaTriGiam, DonHangToiThieu, NgayBatDau, NgayKetThuc, TrangThai)
    VALUES (N'COMBO50', N'SO_TIEN | Combo giảm 50k đơn từ 150k', 50000, 150000, '2026-01-01', '2026-06-30', N'ConHieuLuc');
GO

-- ========== KHACH HANG THEM ==========
DECLARE @HashKhach NVARCHAR(255) = N'100000.eO3ZO8LPVTMe8/HlbuFVmQ==.Zj+ED4UI6A/T3PYIsDr7QGFCul8dh3DjKZPVjWjRhFM=';

DECLARE @KH TABLE (HoTen NVARCHAR(100), SDT NVARCHAR(15), Email NVARCHAR(100), Hang NVARCHAR(20), Diem INT);
INSERT @KH VALUES
(N'Nguyễn Văn An', N'0905123456', N'an.nguyen@gongdek.vn', N'Bac', 85),
(N'Trần Thị Bích', N'0916234567', N'bich.tran@gongdek.vn', N'Vang', 210),
(N'Lê Hoàng Nam', N'0927345678', N'nam.le@gongdek.vn', N'ThanhVien', 45),
(N'Phạm Minh Châu', N'0938456789', N'chau.pham@gongdek.vn', N'KimCuong', 520),
(N'Hoàng Thị Lan', N'0949567890', N'lan.hoang@gongdek.vn', N'Vang', 180),
(N'Võ Quốc Huy', N'0950678901', N'huy.vo@gongdek.vn', N'Bac', 95),
(N'Đặng Thu Hà', N'0961789012', N'ha.dang@gongdek.vn', N'ThanhVien', 60),
(N'Bùi Gia Bảo', N'0972890123', N'bao.bui@gongdek.vn', N'Bac', 110),
(N'Ngô Thanh Tú', N'0983901234', N'tu.ngo@gongdek.vn', N'Vang', 240),
(N'Lý Kim Ngân', N'0994012345', N'ngan.ly@gongdek.vn', N'ThanhVien', 35),
(N'Đinh Quốc Khánh', N'0906111222', N'khanh.dinh@gongdek.vn', N'Bac', 70),
(N'Mai Phương Thảo', N'0907222333', N'thao.mai@gongdek.vn', N'Vang', 195);

INSERT dbo.KhachHang (HoTen, SoDienThoai, Email, MatKhauHash, HangThanhVien, DiemTichLuy, TrangThai, NgayDangKy)
SELECT k.HoTen, k.SDT, k.Email, @HashKhach, k.Hang, k.Diem, N'HoatDong', DATEADD(DAY, -ABS(CHECKSUM(k.Email)) % 120, SYSUTCDATETIME())
FROM @KH k
WHERE NOT EXISTS (SELECT 1 FROM dbo.KhachHang kh WHERE kh.Email = k.Email);
GO

-- ========== DON HANG MAU 01/2026 - 05/2026 ==========
DECLARE @MaAdmin INT = (SELECT MaNV FROM dbo.NhanVien WHERE TenDangNhap = N'admin');
DECLARE @MaNV INT = (SELECT MaNV FROM dbo.NhanVien WHERE TenDangNhap = N'nhanvien');
DECLARE @MaCa INT = (SELECT TOP 1 MaCa FROM dbo.CaLamViec ORDER BY MaCa DESC);
DECLARE @MaSizeM INT = (SELECT MaSize FROM dbo.Size WHERE TenSize = N'M');
DECLARE @MaSizeL INT = (SELECT MaSize FROM dbo.Size WHERE TenSize = N'L');
DECLARE @MaTop1 INT = (SELECT MaTopping FROM dbo.Topping WHERE TenTopping = N'Tran chau den');

IF @MaAdmin IS NULL OR @MaSizeM IS NULL
BEGIN
    RAISERROR(N'Thieu du lieu nen (nhan vien/size). Chay seed.sql truoc.', 16, 1);
    RETURN;
END

DECLARE @DiaChi TABLE (Idx INT IDENTITY(1,1), DiaChi NVARCHAR(255));
INSERT @DiaChi (DiaChi) VALUES
(N'12 Trần Phú, phường Lộc Thọ, Nha Trang'),
(N'35 Biệt Thự, phường Lộc Thọ, Nha Trang'),
(N'88 Lê Hồng Phong, phường Phương Sài, Nha Trang'),
(N'15 Nguyễn Thị Minh Khai, khu Tây Nha Trang'),
(N'102 Ngô Gia Tự, khu Bắc Nha Trang'),
(N'27 Thống Nhất, phường Vĩnh Hòa, Nha Trang'),
(N'5 Hoàng Hoa Thám, phường Vĩnh Phước, Nha Trang'),
(N'60 Võ Cạnh, phường Vĩnh Hải, Nha Trang'),
(N'234 Thống Nhất, khu Bắc Nha Trang'),
(N'18 Yersin, trung tâm Nha Trang');

DECLARE @Ngay DATE = '2026-01-02';
DECLARE @Counter INT = 0;

WHILE @Ngay <= '2026-05-24'
BEGIN
    SET @Counter += 1;
    DECLARE @GhiChu NVARCHAR(50) = N'SEED2026_' + FORMAT(@Counter, '0000');
    IF NOT EXISTS (SELECT 1 FROM dbo.HoaDon WHERE GhiChu = @GhiChu)
    BEGIN
        DECLARE @MaKH INT = (SELECT MaKH FROM (
            SELECT MaKH, ROW_NUMBER() OVER (ORDER BY MaKH) rn FROM dbo.KhachHang WHERE TrangThai = N'HoatDong'
        ) x WHERE rn = ((@Counter - 1) % 12) + 1);
        DECLARE @MaSP INT = (SELECT TOP 1 MaSanPham FROM dbo.SanPham WHERE TrangThai = N'DangBan' ORDER BY NEWID());
        DECLARE @GiaSP DECIMAL(18,2) = (SELECT GiaBanGoc FROM dbo.SanPham WHERE MaSanPham = @MaSP);
        DECLARE @PhuThu DECIMAL(18,2) = CASE WHEN @Counter % 3 = 0 THEN 5000 ELSE 0 END;
        DECLARE @MaSize INT = CASE WHEN @Counter % 3 = 0 THEN @MaSizeL ELSE @MaSizeM END;
        DECLARE @TongMon DECIMAL(18,2) = @GiaSP + @PhuThu;
        DECLARE @ThoiGian DATETIME = DATEADD(HOUR, 8 + (@Counter % 12), CAST(@Ngay AS DATETIME));

        IF @Counter % 4 = 0
        BEGIN
            -- Don online
            DECLARE @PhiShip DECIMAL(18,2) = 12000 + (@Counter % 5) * 1000;
            DECLARE @TongTT DECIMAL(18,2) = @TongMon + @PhiShip;
            DECLARE @TrangThaiOL NVARCHAR(30) = CASE (@Counter % 5)
                WHEN 0 THEN N'ChoXacNhan' WHEN 1 THEN N'DangXuLy' WHEN 2 THEN N'DangGiao'
                WHEN 3 THEN N'HoanThanh' ELSE N'DaHuy' END;
            DECLARE @KHInfo TABLE (HoTen NVARCHAR(100), SDT NVARCHAR(15));
            INSERT @KHInfo SELECT HoTen, SoDienThoai FROM dbo.KhachHang WHERE MaKH = @MaKH;
            DECLARE @DiaChiGiao NVARCHAR(255) = (SELECT DiaChi FROM @DiaChi WHERE Idx = ((@Counter - 1) % 10) + 1);

            INSERT dbo.HoaDon (LoaiDon, TrangThaiHoaDon, MaKH, MaNVLap, MaCa, TongTienMon, PhiGiaoHang, TienGiamGia, DiemSuDung, TongThanhToan, PhuongThucThanhToan, ThoiGianLap, ThoiGianThanhToan, GhiChu)
            VALUES (N'Online', CASE WHEN @TrangThaiOL = N'HoanThanh' THEN N'HoanThanh' WHEN @TrangThaiOL = N'DaHuy' THEN N'DaHuy' ELSE N'DaThanhToan' END,
                @MaKH, @MaAdmin, @MaCa, @TongMon, @PhiShip, 0, 0, @TongTT, N'ChuyenKhoan', @ThoiGian, @ThoiGian, @GhiChu);
            DECLARE @HDOL INT = SCOPE_IDENTITY();
            INSERT dbo.ChiTietHoaDon (MaHoaDon, MaSanPham, MaSize, SoLuong, DonGiaGoc, PhuThuSize, ThanhTien)
            VALUES (@HDOL, @MaSP, @MaSize, 1, @GiaSP, @PhuThu, @TongMon);
            INSERT dbo.DonHangOnline (MaHoaDon, HoTenNhanHang, SoDienThoaiNhan, DiaChiGiao, TrangThaiOnline, GhiChuGiaoHang, ThoiGianXacNhan, ThoiGianHoanThanh, LyDoHuy)
            SELECT @HDOL, k.HoTen, k.SDT, @DiaChiGiao, @TrangThaiOL,
                N'Giao giờ hành chính, gọi trước 10 phút', 
                CASE WHEN @TrangThaiOL <> N'ChoXacNhan' THEN @ThoiGian ELSE NULL END,
                CASE WHEN @TrangThaiOL = N'HoanThanh' THEN DATEADD(HOUR, 2, @ThoiGian) ELSE NULL END,
                CASE WHEN @TrangThaiOL = N'DaHuy' THEN N'Khách đổi ý / hết món' ELSE NULL END
            FROM @KHInfo k;
        END
        ELSE
        BEGIN
            -- Don tai quay (POS)
            INSERT dbo.HoaDon (LoaiDon, TrangThaiHoaDon, MaKH, MaNVLap, MaCa, TongTienMon, PhiGiaoHang, TienGiamGia, DiemSuDung, TongThanhToan, PhuongThucThanhToan, ThoiGianLap, ThoiGianThanhToan, GhiChu)
            VALUES (N'TaiQuay', N'HoanThanh', @MaKH, ISNULL(@MaNV, @MaAdmin), @MaCa, @TongMon, 0, 0, 0, @TongMon,
                CASE (@Counter % 3) WHEN 0 THEN N'TienMat' WHEN 1 THEN N'ChuyenKhoan' ELSE N'ViDienTu' END,
                @ThoiGian, @ThoiGian, @GhiChu);
            DECLARE @HDPOS INT = SCOPE_IDENTITY();
            INSERT dbo.ChiTietHoaDon (MaHoaDon, MaSanPham, MaSize, SoLuong, DonGiaGoc, PhuThuSize, ThanhTien, GhiChu)
            VALUES (@HDPOS, @MaSP, @MaSize, 1 + (@Counter % 2), @GiaSP, @PhuThu, @TongMon, N'Ít đá, 70% đường');
            IF @MaTop1 IS NOT NULL AND @Counter % 2 = 0
            BEGIN
                DECLARE @CT INT = SCOPE_IDENTITY();
                INSERT dbo.ChiTietHoaDon_Topping (MaChiTiet, MaTopping, DonGiaTopping, SoLuong)
                VALUES (@CT, @MaTop1, 5000, 1);
            END
        END
    END

    SET @Ngay = DATEADD(DAY, CASE WHEN @Counter % 7 = 0 THEN 2 ELSE 1 END, @Ngay);
END
GO

-- Danh gia mau
DECLARE @HDHT INT = (SELECT TOP 1 MaHoaDon FROM dbo.HoaDon WHERE TrangThaiHoaDon = N'HoanThanh' ORDER BY MaHoaDon DESC);
DECLARE @SPDG INT = (SELECT TOP 1 MaSanPham FROM dbo.SanPham WHERE TenSanPham = N'Trà sữa truyền thống');
DECLARE @KHDG INT = (SELECT MaKH FROM dbo.HoaDon WHERE MaHoaDon = @HDHT);
IF @HDHT IS NOT NULL AND @SPDG IS NOT NULL AND @KHDG IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.DanhGia WHERE MaHoaDon = @HDHT AND MaSanPham = @SPDG)
    INSERT dbo.DanhGia (MaHoaDon, MaSanPham, MaKH, SoSao, NoiDung, NgayDanhGia)
    VALUES (@HDHT, @SPDG, @KHDG, 5, N'Trà sữa thơm, giao nhanh tại Nha Trang!', DATEADD(DAY, -1, SYSUTCDATETIME()));
GO

PRINT N'seed_catalog_demo.sql completed.';
GO
