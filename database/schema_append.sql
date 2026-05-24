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
