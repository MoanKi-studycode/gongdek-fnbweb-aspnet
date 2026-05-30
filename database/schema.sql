CREATE TABLE [DanhMuc] (
    [MaDanhMuc] int NOT NULL IDENTITY,
    [TenDanhMuc] nvarchar(100) NOT NULL,
    [MoTa] nvarchar(255) NULL,
    [ThuTuHienThi] int NOT NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'HienThi',
    CONSTRAINT [PK_DanhMuc] PRIMARY KEY ([MaDanhMuc]),
    CONSTRAINT [CK_DanhMuc_TrangThai] CHECK ([TrangThai] = N'An' OR [TrangThai] = N'HienThi')
);
GO


CREATE TABLE [KhachHang] (
    [MaKH] int NOT NULL IDENTITY,
    [HoTen] nvarchar(100) NOT NULL,
    [SoDienThoai] nvarchar(15) NOT NULL,
    [Email] nvarchar(100) NOT NULL,
    [MatKhauHash] nvarchar(255) NOT NULL,
    [NgaySinh] date NULL,
    [GioiTinh] nvarchar(10) NULL,
    [HangThanhVien] nvarchar(20) NOT NULL DEFAULT N'ThanhVien',
    [DiemTichLuy] int NOT NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'HoatDong',
    [NgayDangKy] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_KhachHang] PRIMARY KEY ([MaKH]),
    CONSTRAINT [CK_KhachHang_Diem] CHECK ([DiemTichLuy] >= 0),
    CONSTRAINT [CK_KhachHang_Hang] CHECK ([HangThanhVien] IN (N'ThanhVien', N'Bac', N'Vang', N'KimCuong')),
    CONSTRAINT [CK_KhachHang_TrangThai] CHECK ([TrangThai] IN (N'HoatDong', N'Khoa'))
);
GO


CREATE TABLE [KhungCa] (
    [MaKhungCa] int NOT NULL IDENTITY,
    [TenCa] nvarchar(50) NOT NULL,
    [GioBatDau] time NOT NULL,
    [GioKetThuc] time NOT NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'HoatDong',
    CONSTRAINT [PK_KhungCa] PRIMARY KEY ([MaKhungCa])
);
GO


CREATE TABLE [NguyenLieu] (
    [MaNL] int NOT NULL IDENTITY,
    [TenNL] nvarchar(150) NOT NULL,
    [DonViTinh] nvarchar(20) NOT NULL,
    [SoLuongTon] decimal(18,2) NOT NULL,
    [SoLuongCanhBao] decimal(18,2) NOT NULL,
    [HanSuDungGanNhat] date NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'ConHang',
    CONSTRAINT [PK_NguyenLieu] PRIMARY KEY ([MaNL]),
    CONSTRAINT [CK_NL_SoLuong] CHECK ([SoLuongTon] >= 0 AND [SoLuongCanhBao] >= 0)
);
GO


CREATE TABLE [NhaCungCap] (
    [MaNCC] int NOT NULL IDENTITY,
    [TenNCC] nvarchar(150) NOT NULL,
    [SoDienThoai] nvarchar(15) NULL,
    [DiaChi] nvarchar(255) NULL,
    [Email] nvarchar(100) NULL,
    [NguoiLienHe] nvarchar(100) NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'DangHopTac',
    CONSTRAINT [PK_NhaCungCap] PRIMARY KEY ([MaNCC])
);
GO


CREATE TABLE [Size] (
    [MaSize] int NOT NULL IDENTITY,
    [TenSize] nvarchar(10) NOT NULL,
    [PhuThu] decimal(18,2) NOT NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'DangApDung',
    CONSTRAINT [PK_Size] PRIMARY KEY ([MaSize]),
    CONSTRAINT [CK_Size_PhuThu] CHECK ([PhuThu] >= 0)
);
GO


CREATE TABLE [Topping] (
    [MaTopping] int NOT NULL IDENTITY,
    [TenTopping] nvarchar(100) NOT NULL,
    [DonGia] decimal(18,2) NOT NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'DangBan',
    CONSTRAINT [PK_Topping] PRIMARY KEY ([MaTopping]),
    CONSTRAINT [CK_Topping_DonGia] CHECK ([DonGia] >= 0)
);
GO


CREATE TABLE [VaiTro] (
    [MaVaiTro] int NOT NULL IDENTITY,
    [TenVaiTro] nvarchar(50) NOT NULL,
    [MoTa] nvarchar(200) NULL,
    CONSTRAINT [PK_VaiTro] PRIMARY KEY ([MaVaiTro])
);
GO


CREATE TABLE [Voucher] (
    [MaVoucher] int NOT NULL IDENTITY,
    [MaCode] nvarchar(30) NOT NULL,
    [MoTa] nvarchar(255) NULL,
    [GiaTriGiam] decimal(18,2) NOT NULL,
    [DonHangToiThieu] decimal(18,2) NULL,
    [NgayBatDau] date NOT NULL,
    [NgayKetThuc] date NOT NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'ConHieuLuc',
    CONSTRAINT [PK_Voucher] PRIMARY KEY ([MaVoucher]),
    CONSTRAINT [CK_Voucher_GiaTri] CHECK ([GiaTriGiam] >= 0)
);
GO


CREATE TABLE [SanPham] (
    [MaSanPham] int NOT NULL IDENTITY,
    [MaDanhMuc] int NOT NULL,
    [TenSanPham] nvarchar(150) NOT NULL,
    [MoTa] nvarchar(500) NULL,
    [HinhAnh] nvarchar(500) NULL,
    [GiaBanGoc] decimal(18,2) NOT NULL,
    [GhiChuPhaChe] nvarchar(500) NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'DangBan',
    CONSTRAINT [PK_SanPham] PRIMARY KEY ([MaSanPham]),
    CONSTRAINT [CK_SanPham_Gia] CHECK ([GiaBanGoc] >= 0),
    CONSTRAINT [FK_SanPham_DanhMuc_MaDanhMuc] FOREIGN KEY ([MaDanhMuc]) REFERENCES [DanhMuc] ([MaDanhMuc]) ON DELETE NO ACTION
);
GO


CREATE TABLE [NhanVien] (
    [MaNV] int NOT NULL IDENTITY,
    [HoTen] nvarchar(100) NOT NULL,
    [SoDienThoai] nvarchar(15) NULL,
    [NgaySinh] date NULL,
    [GioiTinh] nvarchar(10) NULL,
    [DiaChi] nvarchar(255) NULL,
    [TenDangNhap] nvarchar(50) NOT NULL,
    [MatKhauHash] nvarchar(255) NOT NULL,
    [MaVaiTro] int NOT NULL,
    [TrangThai] nvarchar(20) NOT NULL DEFAULT N'HoatDong',
    [NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_NhanVien] PRIMARY KEY ([MaNV]),
    CONSTRAINT [FK_NhanVien_VaiTro_MaVaiTro] FOREIGN KEY ([MaVaiTro]) REFERENCES [VaiTro] ([MaVaiTro]) ON DELETE NO ACTION
);
GO


CREATE TABLE [CaLamViec] (
    [MaCa] int NOT NULL IDENTITY,
    [MaKhungCa] int NOT NULL,
    [MaNV] int NOT NULL,
    [NgayLam] date NOT NULL,
    [ThoiGianMo] datetime2 NOT NULL,
    [ThoiGianDong] datetime2 NULL,
    [TienQuyDauCa] decimal(18,2) NOT NULL DEFAULT 0.0,
    [TienMatThucTe] decimal(18,2) NULL,
    [TrangThaiCa] nvarchar(20) NOT NULL DEFAULT N'DangMo',
    [GhiChu] nvarchar(255) NULL,
    CONSTRAINT [PK_CaLamViec] PRIMARY KEY ([MaCa]),
    CONSTRAINT [CK_CaLamViec_TienMatThucTe] CHECK ([TienMatThucTe] IS NULL OR [TienMatThucTe] >= 0),
    CONSTRAINT [CK_CaLamViec_TienQuy] CHECK ([TienQuyDauCa] >= 0),
    CONSTRAINT [CK_CaLamViec_TrangThai] CHECK ([TrangThaiCa] = N'DaDong' OR [TrangThaiCa] = N'DangMo'),
    CONSTRAINT [FK_CaLamViec_KhungCa_MaKhungCa] FOREIGN KEY ([MaKhungCa]) REFERENCES [KhungCa] ([MaKhungCa]) ON DELETE NO ACTION,
    CONSTRAINT [FK_CaLamViec_NhanVien_MaNV] FOREIGN KEY ([MaNV]) REFERENCES [NhanVien] ([MaNV]) ON DELETE NO ACTION
);
GO


CREATE TABLE [PhieuNhapKho] (
    [MaPhieuNhap] int NOT NULL IDENTITY,
    [MaNCC] int NOT NULL,
    [MaNVLap] int NOT NULL,
    [MaNVDuyet] int NULL,
    [NgayNhap] date NOT NULL,
    [NgayDuyet] datetime2 NULL,
    [TrangThaiPhieu] nvarchar(20) NOT NULL DEFAULT N'ChoDuyet',
    [TongTienNhap] decimal(18,2) NOT NULL,
    [GhiChu] nvarchar(255) NULL,
    CONSTRAINT [PK_PhieuNhapKho] PRIMARY KEY ([MaPhieuNhap]),
    CONSTRAINT [CK_PNK_TongTien] CHECK ([TongTienNhap] >= 0),
    CONSTRAINT [FK_PhieuNhapKho_NhaCungCap_MaNCC] FOREIGN KEY ([MaNCC]) REFERENCES [NhaCungCap] ([MaNCC]) ON DELETE NO ACTION,
    CONSTRAINT [FK_PhieuNhapKho_NhanVien_MaNVDuyet] FOREIGN KEY ([MaNVDuyet]) REFERENCES [NhanVien] ([MaNV]) ON DELETE SET NULL,
    CONSTRAINT [FK_PhieuNhapKho_NhanVien_MaNVLap] FOREIGN KEY ([MaNVLap]) REFERENCES [NhanVien] ([MaNV]) ON DELETE NO ACTION
);
GO


CREATE TABLE [HoaDon] (
    [MaHoaDon] int NOT NULL IDENTITY,
    [LoaiDon] nvarchar(20) NOT NULL,
    [TrangThaiHoaDon] nvarchar(30) NOT NULL DEFAULT N'ChoThanhToan',
    [MaKH] int NULL,
    [MaNVLap] int NOT NULL,
    [MaCa] int NULL,
    [TongTienMon] decimal(18,2) NOT NULL,
    [PhiGiaoHang] decimal(18,2) NOT NULL,
    [TienGiamGia] decimal(18,2) NOT NULL,
    [DiemSuDung] int NOT NULL,
    [TongThanhToan] decimal(18,2) NOT NULL,
    [PhuongThucThanhToan] nvarchar(30) NULL,
    [TienKhachDua] decimal(18,2) NULL,
    [TienThua] decimal(18,2) NULL,
    [MaVoucher] int NULL,
    [ThoiGianLap] datetime2 NOT NULL,
    [ThoiGianThanhToan] datetime2 NULL,
    [GhiChu] nvarchar(500) NULL,
    CONSTRAINT [PK_HoaDon] PRIMARY KEY ([MaHoaDon]),
    CONSTRAINT [CK_HoaDon_LoaiDon] CHECK ([LoaiDon] = N'Online' OR [LoaiDon] = N'TaiQuay'),
    CONSTRAINT [CK_HoaDon_Tien] CHECK ([TongTienMon] >= 0 AND [PhiGiaoHang] >= 0 AND [TienGiamGia] >= 0 AND [DiemSuDung] >= 0 AND [TongThanhToan] >= 0),
    CONSTRAINT [CK_HoaDon_TrangThai] CHECK ([TrangThaiHoaDon] = N'DaHuy' OR [TrangThaiHoaDon] = N'HoanThanh' OR [TrangThaiHoaDon] = N'ChoPhaChe' OR [TrangThaiHoaDon] = N'DaThanhToan' OR [TrangThaiHoaDon] = N'ChoThanhToan'),
    CONSTRAINT [FK_HoaDon_CaLamViec_MaCa] FOREIGN KEY ([MaCa]) REFERENCES [CaLamViec] ([MaCa]) ON DELETE SET NULL,
    CONSTRAINT [FK_HoaDon_KhachHang_MaKH] FOREIGN KEY ([MaKH]) REFERENCES [KhachHang] ([MaKH]) ON DELETE SET NULL,
    CONSTRAINT [FK_HoaDon_NhanVien_MaNVLap] FOREIGN KEY ([MaNVLap]) REFERENCES [NhanVien] ([MaNV]) ON DELETE NO ACTION,
    CONSTRAINT [FK_HoaDon_Voucher_MaVoucher] FOREIGN KEY ([MaVoucher]) REFERENCES [Voucher] ([MaVoucher]) ON DELETE SET NULL
);
GO


CREATE TABLE [ChiTietPhieuNhap] (
    [MaChiTietNhap] int NOT NULL IDENTITY,
    [MaPhieuNhap] int NOT NULL,
    [MaNL] int NOT NULL,
    [SoLuongNhap] decimal(18,2) NOT NULL,
    [DonGiaNhap] decimal(18,2) NOT NULL,
    [HanSuDung] date NULL,
    [ThanhTien] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_ChiTietPhieuNhap] PRIMARY KEY ([MaChiTietNhap]),
    CONSTRAINT [CK_CTPN_SoLuong] CHECK ([SoLuongNhap] > 0),
    CONSTRAINT [CK_CTPN_Tien] CHECK ([DonGiaNhap] >= 0 AND [ThanhTien] >= 0),
    CONSTRAINT [FK_ChiTietPhieuNhap_NguyenLieu_MaNL] FOREIGN KEY ([MaNL]) REFERENCES [NguyenLieu] ([MaNL]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ChiTietPhieuNhap_PhieuNhapKho_MaPhieuNhap] FOREIGN KEY ([MaPhieuNhap]) REFERENCES [PhieuNhapKho] ([MaPhieuNhap]) ON DELETE CASCADE
);
GO


CREATE TABLE [ChiTietHoaDon] (
    [MaChiTiet] int NOT NULL IDENTITY,
    [MaHoaDon] int NOT NULL,
    [MaSanPham] int NOT NULL,
    [MaSize] int NOT NULL,
    [SoLuong] int NOT NULL,
    [DonGiaGoc] decimal(18,2) NOT NULL,
    [PhuThuSize] decimal(18,2) NOT NULL,
    [ThanhTien] decimal(18,2) NOT NULL,
    [GhiChu] nvarchar(255) NULL,
    CONSTRAINT [PK_ChiTietHoaDon] PRIMARY KEY ([MaChiTiet]),
    CONSTRAINT [CK_CTHD_SoLuong] CHECK ([SoLuong] > 0),
    CONSTRAINT [CK_CTHD_Tien] CHECK ([DonGiaGoc] >= 0 AND [PhuThuSize] >= 0 AND [ThanhTien] >= 0),
    CONSTRAINT [FK_ChiTietHoaDon_HoaDon_MaHoaDon] FOREIGN KEY ([MaHoaDon]) REFERENCES [HoaDon] ([MaHoaDon]) ON DELETE CASCADE,
    CONSTRAINT [FK_ChiTietHoaDon_SanPham_MaSanPham] FOREIGN KEY ([MaSanPham]) REFERENCES [SanPham] ([MaSanPham]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ChiTietHoaDon_Size_MaSize] FOREIGN KEY ([MaSize]) REFERENCES [Size] ([MaSize]) ON DELETE NO ACTION
);
GO


CREATE TABLE [DanhGia] (
    [MaDanhGia] int NOT NULL IDENTITY,
    [MaHoaDon] int NOT NULL,
    [MaSanPham] int NOT NULL,
    [MaKH] int NULL,
    [SoSao] tinyint NOT NULL,
    [NoiDung] nvarchar(500) NULL,
    [NgayDanhGia] datetime2 NOT NULL,
    CONSTRAINT [PK_DanhGia] PRIMARY KEY ([MaDanhGia]),
    CONSTRAINT [CK_DG_SoSao] CHECK ([SoSao] >= 1 AND [SoSao] <= 5),
    CONSTRAINT [FK_DanhGia_HoaDon_MaHoaDon] FOREIGN KEY ([MaHoaDon]) REFERENCES [HoaDon] ([MaHoaDon]) ON DELETE NO ACTION,
    CONSTRAINT [FK_DanhGia_KhachHang_MaKH] FOREIGN KEY ([MaKH]) REFERENCES [KhachHang] ([MaKH]) ON DELETE SET NULL,
    CONSTRAINT [FK_DanhGia_SanPham_MaSanPham] FOREIGN KEY ([MaSanPham]) REFERENCES [SanPham] ([MaSanPham]) ON DELETE NO ACTION
);
GO


CREATE TABLE [DonHangOnline] (
    [MaHoaDon] int NOT NULL,
    [HoTenNhanHang] nvarchar(100) NOT NULL,
    [SoDienThoaiNhan] nvarchar(15) NOT NULL,
    [DiaChiGiao] nvarchar(255) NOT NULL,
    [GhiChuGiaoHang] nvarchar(255) NULL,
    [TrangThaiOnline] nvarchar(30) NOT NULL DEFAULT N'ChoXacNhan',
    [MaNVXacNhan] int NULL,
    [ThoiGianXacNhan] datetime2 NULL,
    [ThoiGianHoanThanh] datetime2 NULL,
    [LyDoHuy] nvarchar(255) NULL,
    CONSTRAINT [PK_DonHangOnline] PRIMARY KEY ([MaHoaDon]),
    CONSTRAINT [CK_DonHangOnline_TrangThai] CHECK ([TrangThaiOnline] = N'DaHuy' OR [TrangThaiOnline] = N'HoanThanh' OR [TrangThaiOnline] = N'DangGiao' OR [TrangThaiOnline] = N'DangXuLy' OR [TrangThaiOnline] = N'ChoXacNhan'),
    CONSTRAINT [FK_DonHangOnline_HoaDon_MaHoaDon] FOREIGN KEY ([MaHoaDon]) REFERENCES [HoaDon] ([MaHoaDon]) ON DELETE CASCADE,
    CONSTRAINT [FK_DonHangOnline_NhanVien_MaNVXacNhan] FOREIGN KEY ([MaNVXacNhan]) REFERENCES [NhanVien] ([MaNV]) ON DELETE SET NULL
);
GO


CREATE TABLE [PhieuHoanHuy] (
    [MaPhieu] int NOT NULL IDENTITY,
    [MaHoaDon] int NOT NULL,
    [MaNVXuLy] int NOT NULL,
    [HinhThucXuLy] nvarchar(50) NOT NULL,
    [LyDo] nvarchar(500) NOT NULL,
    [SoTienHoan] decimal(18,2) NULL,
    [HinhThucHoan] nvarchar(30) NULL,
    [TrangThaiXuLy] nvarchar(30) NOT NULL DEFAULT N'DaGhiNhan',
    [ThoiGianLap] datetime2 NOT NULL,
    CONSTRAINT [PK_PhieuHoanHuy] PRIMARY KEY ([MaPhieu]),
    CONSTRAINT [FK_PhieuHoanHuy_HoaDon_MaHoaDon] FOREIGN KEY ([MaHoaDon]) REFERENCES [HoaDon] ([MaHoaDon]) ON DELETE NO ACTION,
    CONSTRAINT [FK_PhieuHoanHuy_NhanVien_MaNVXuLy] FOREIGN KEY ([MaNVXuLy]) REFERENCES [NhanVien] ([MaNV]) ON DELETE NO ACTION
);
GO


CREATE TABLE [ChiTietHoaDon_Topping] (
    [MaChiTiet] int NOT NULL,
    [MaTopping] int NOT NULL,
    [DonGiaTopping] decimal(18,2) NOT NULL,
    [SoLuong] int NOT NULL DEFAULT 1,
    CONSTRAINT [PK_ChiTietHoaDon_Topping] PRIMARY KEY ([MaChiTiet], [MaTopping]),
    CONSTRAINT [CK_CTT_DonGia] CHECK ([DonGiaTopping] >= 0),
    CONSTRAINT [CK_CTT_SoLuong] CHECK ([SoLuong] > 0),
    CONSTRAINT [FK_ChiTietHoaDon_Topping_ChiTietHoaDon_MaChiTiet] FOREIGN KEY ([MaChiTiet]) REFERENCES [ChiTietHoaDon] ([MaChiTiet]) ON DELETE CASCADE,
    CONSTRAINT [FK_ChiTietHoaDon_Topping_Topping_MaTopping] FOREIGN KEY ([MaTopping]) REFERENCES [Topping] ([MaTopping]) ON DELETE NO ACTION
);
GO


CREATE INDEX [IX_CaLamViec_MaKhungCa] ON [CaLamViec] ([MaKhungCa]);
GO


CREATE INDEX [IX_CaLamViec_MaNV] ON [CaLamViec] ([MaNV]);
GO


CREATE INDEX [IX_ChiTietHoaDon_MaHoaDon] ON [ChiTietHoaDon] ([MaHoaDon]);
GO


CREATE INDEX [IX_ChiTietHoaDon_MaSanPham] ON [ChiTietHoaDon] ([MaSanPham]);
GO


CREATE INDEX [IX_ChiTietHoaDon_MaSize] ON [ChiTietHoaDon] ([MaSize]);
GO


CREATE INDEX [IX_ChiTietHoaDon_Topping_MaTopping] ON [ChiTietHoaDon_Topping] ([MaTopping]);
GO


CREATE INDEX [IX_ChiTietPhieuNhap_MaNL] ON [ChiTietPhieuNhap] ([MaNL]);
GO


CREATE INDEX [IX_ChiTietPhieuNhap_MaPhieuNhap] ON [ChiTietPhieuNhap] ([MaPhieuNhap]);
GO


CREATE INDEX [IX_DanhGia_MaHoaDon] ON [DanhGia] ([MaHoaDon]);
GO


CREATE INDEX [IX_DanhGia_MaKH] ON [DanhGia] ([MaKH]);
GO


CREATE INDEX [IX_DanhGia_MaSanPham] ON [DanhGia] ([MaSanPham]);
GO


CREATE INDEX [IX_DonHangOnline_MaNVXacNhan] ON [DonHangOnline] ([MaNVXacNhan]);
GO


CREATE INDEX [IX_DonHangOnline_TrangThaiOnline] ON [DonHangOnline] ([TrangThaiOnline]);
GO


CREATE INDEX [IX_HoaDon_LoaiDon] ON [HoaDon] ([LoaiDon]);
GO


CREATE INDEX [IX_HoaDon_MaCa] ON [HoaDon] ([MaCa]);
GO


CREATE INDEX [IX_HoaDon_MaKH] ON [HoaDon] ([MaKH]);
GO


CREATE INDEX [IX_HoaDon_MaNVLap] ON [HoaDon] ([MaNVLap]);
GO


CREATE INDEX [IX_HoaDon_MaVoucher] ON [HoaDon] ([MaVoucher]);
GO


CREATE INDEX [IX_HoaDon_ThoiGianLap] ON [HoaDon] ([ThoiGianLap]);
GO


CREATE INDEX [IX_HoaDon_TrangThaiHoaDon] ON [HoaDon] ([TrangThaiHoaDon]);
GO


CREATE UNIQUE INDEX [IX_KhachHang_Email] ON [KhachHang] ([Email]);
GO


CREATE UNIQUE INDEX [IX_KhachHang_SoDienThoai] ON [KhachHang] ([SoDienThoai]);
GO


CREATE INDEX [IX_NhanVien_MaVaiTro] ON [NhanVien] ([MaVaiTro]);
GO


CREATE UNIQUE INDEX [IX_NhanVien_TenDangNhap] ON [NhanVien] ([TenDangNhap]);
GO


CREATE INDEX [IX_PhieuHoanHuy_MaHoaDon] ON [PhieuHoanHuy] ([MaHoaDon]);
GO


CREATE INDEX [IX_PhieuHoanHuy_MaNVXuLy] ON [PhieuHoanHuy] ([MaNVXuLy]);
GO


CREATE INDEX [IX_PhieuNhapKho_MaNCC] ON [PhieuNhapKho] ([MaNCC]);
GO


CREATE INDEX [IX_PhieuNhapKho_MaNVDuyet] ON [PhieuNhapKho] ([MaNVDuyet]);
GO


CREATE INDEX [IX_PhieuNhapKho_MaNVLap] ON [PhieuNhapKho] ([MaNVLap]);
GO


CREATE INDEX [IX_PhieuNhapKho_NgayNhap] ON [PhieuNhapKho] ([NgayNhap]);
GO


CREATE INDEX [IX_SanPham_MaDanhMuc] ON [SanPham] ([MaDanhMuc]);
GO


CREATE INDEX [IX_SanPham_TenSanPham] ON [SanPham] ([TenSanPham]);
GO


CREATE UNIQUE INDEX [IX_Size_TenSize] ON [Size] ([TenSize]);
GO


CREATE UNIQUE INDEX [IX_VaiTro_TenVaiTro] ON [VaiTro] ([TenVaiTro]);
GO


CREATE UNIQUE INDEX [IX_Voucher_MaCode] ON [Voucher] ([MaCode]);
GO

-- GongDek custom SQL objects
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_VaiTro_TenVaiTro')
BEGIN
    ALTER TABLE [dbo].[VaiTro] WITH CHECK ADD CONSTRAINT [CK_VaiTro_TenVaiTro]
    CHECK ([TenVaiTro] IN (N'QuanLy', N'NhanVien', N'KhachHang'));
END
GO

IF OBJECT_ID(N'dbo.ufn_TongDoanhThuTheoNgay', N'FN') IS NULL
EXEC(N'
CREATE FUNCTION [dbo].[ufn_TongDoanhThuTheoNgay](@Ngay DATE)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @Tong DECIMAL(18,2);
    SELECT @Tong = ISNULL(SUM([TongThanhToan]), 0)
    FROM [dbo].[HoaDon]
    WHERE CAST([ThoiGianLap] AS DATE) = @Ngay
      AND [TrangThaiHoaDon] IN (N''DaThanhToan'', N''ChoPhaChe'', N''HoanThanh'');
    RETURN ISNULL(@Tong, 0);
END
');
GO

IF OBJECT_ID(N'dbo.vw_TopSanPham', N'V') IS NULL
EXEC(N'
CREATE VIEW [dbo].[vw_TopSanPham]
AS
SELECT TOP (100)
    sp.[MaSanPham], sp.[TenSanPham],
    SUM(ct.[SoLuong]) AS [TongSoLuong],
    SUM(ct.[ThanhTien]) AS [TongDoanhThu]
FROM [dbo].[ChiTietHoaDon] ct
INNER JOIN [dbo].[SanPham] sp ON sp.[MaSanPham] = ct.[MaSanPham]
INNER JOIN [dbo].[HoaDon] hd ON hd.[MaHoaDon] = ct.[MaHoaDon]
WHERE hd.[TrangThaiHoaDon] IN (N''DaThanhToan'', N''ChoPhaChe'', N''HoanThanh'')
GROUP BY sp.[MaSanPham], sp.[TenSanPham]
ORDER BY SUM(ct.[SoLuong]) DESC
');
GO

IF OBJECT_ID(N'dbo.sp_BaoCaoDoanhThu', N'P') IS NULL
EXEC(N'
CREATE PROCEDURE [dbo].[sp_BaoCaoDoanhThu]
    @TuNgay DATE, @DenNgay DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT hd.[MaHoaDon], hd.[ThoiGianLap], nv.[HoTen] AS [NhanVienLap],
           hd.[LoaiDon], hd.[PhuongThucThanhToan], hd.[TrangThaiHoaDon],
           hd.[TongTienMon], hd.[TienGiamGia], hd.[PhiGiaoHang], hd.[TongThanhToan]
    FROM [dbo].[HoaDon] hd
    INNER JOIN [dbo].[NhanVien] nv ON nv.[MaNV] = hd.[MaNVLap]
    WHERE hd.[TrangThaiHoaDon] = N''HoanThanh''
      AND CAST(hd.[ThoiGianLap] AS DATE) BETWEEN @TuNgay AND @DenNgay
    ORDER BY hd.[ThoiGianLap];
END
');
GO
