using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.BaoCaoDtos;
using GongDek_Nhom20.Enums;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Repositories;

/// <summary>Repository truy vấn dữ liệu báo cáo doanh thu.</summary>
public class BaoCaoRepository : IBaoCaoRepository
{
    private readonly GongDekDbContext _context;

    public BaoCaoRepository(GongDekDbContext context)
    {
        _context = context;
    }

    #region Báo cáo doanh thu

    public async Task<BaoCaoDoanhThuTongHopDto> GetBaoCaoDoanhThuAsync(DateOnly tuNgay, DateOnly denNgay)
    {
        var tu = tuNgay.ToDateTime(TimeOnly.MinValue);
        var den = denNgay.ToDateTime(TimeOnly.MaxValue);

        var chiTiet = await _context.HoaDons
            .Include(h => h.NhanVienLap)
            .Where(h => TrangThaiHoaDonDaThanhToan.Values.Contains(h.TrangThaiHoaDon)
                && h.ThoiGianLap >= tu
                && h.ThoiGianLap <= den)
            .OrderBy(h => h.ThoiGianLap)
            .Select(h => new BaoCaoDoanhThuChiTietDto
            {
                MaHoaDon = h.MaHoaDon,
                ThoiGianLap = h.ThoiGianLap,
                NhanVienLap = h.NhanVienLap.HoTen,
                LoaiDon = h.LoaiDon,
                PhuongThucThanhToan = h.PhuongThucThanhToan,
                TrangThaiHoaDon = h.TrangThaiHoaDon,
                TongTienMon = h.TongTienMon,
                TienGiamGia = h.TienGiamGia,
                PhiGiaoHang = h.PhiGiaoHang,
                TongThanhToan = h.TongThanhToan,
            })
            .ToListAsync();

        return new BaoCaoDoanhThuTongHopDto
        {
            TuNgay = tuNgay,
            DenNgay = denNgay,
            NgayXuat = DateTime.Now,
            TongSoHoaDon = chiTiet.Count,
            TongDoanhThu = chiTiet.Sum(x => x.TongThanhToan),
            TongTienMat = chiTiet.Where(x => x.PhuongThucThanhToan == PhuongThucThanhToan.TienMat).Sum(x => x.TongThanhToan),
            TongChuyenKhoan = chiTiet.Where(x => x.PhuongThucThanhToan == PhuongThucThanhToan.ChuyenKhoan).Sum(x => x.TongThanhToan),
            TongViDienTu = chiTiet.Where(x => x.PhuongThucThanhToan == PhuongThucThanhToan.ViDienTu).Sum(x => x.TongThanhToan),
            ChiTiet = chiTiet,
        };
    }

    #endregion
}
