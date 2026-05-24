using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.DashboardDtos;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Repositories;

/// <summary>Repository truy vấn dữ liệu dashboard từ DB thật.</summary>
public class DashboardRepository : IDashboardRepository
{
    private readonly GongDekDbContext _context;

    public DashboardRepository(GongDekDbContext context)
    {
        _context = context;
    }

    #region Truy vấn doanh thu và đơn hàng

    private IQueryable<HoaDon> HoaDonDaThanhToan =>
        _context.HoaDons.Where(h => TrangThaiHoaDonDaThanhToan.Values.Contains(h.TrangThaiHoaDon));

    private static DateTime StartOfDay(DateOnly date) =>
        date.ToDateTime(TimeOnly.MinValue);

    private static DateTime EndOfDay(DateOnly date) =>
        date.ToDateTime(TimeOnly.MaxValue);

    public async Task<decimal> SumDoanhThuAsync(DateOnly tuNgay, DateOnly denNgay)
    {
        var tu = StartOfDay(tuNgay);
        var den = EndOfDay(denNgay);

        return await HoaDonDaThanhToan
            .Where(h => h.ThoiGianLap >= tu && h.ThoiGianLap <= den)
            .SumAsync(h => h.TongThanhToan);
    }

    public async Task<int> CountHoaDonAsync(DateOnly tuNgay, DateOnly denNgay)
    {
        var tu = StartOfDay(tuNgay);
        var den = EndOfDay(denNgay);

        return await HoaDonDaThanhToan
            .Where(h => h.ThoiGianLap >= tu && h.ThoiGianLap <= den)
            .CountAsync();
    }

    public async Task<(int TaiQuay, int Online)> CountDonTheoLoaiAsync(DateOnly ngay)
    {
        var tu = StartOfDay(ngay);
        var den = EndOfDay(ngay);

        var query = HoaDonDaThanhToan.Where(h => h.ThoiGianLap >= tu && h.ThoiGianLap <= den);

        var taiQuay = await query.CountAsync(h => h.LoaiDon == LoaiDon.TaiQuay);
        var online = await query.CountAsync(h => h.LoaiDon == LoaiDon.Online);

        return (taiQuay, online);
    }

    public async Task<int> CountKhachHomNayAsync(DateOnly ngay)
    {
        var tu = StartOfDay(ngay);
        var den = EndOfDay(ngay);

        return await HoaDonDaThanhToan
            .Where(h => h.ThoiGianLap >= tu && h.ThoiGianLap <= den && h.MaKH != null)
            .Select(h => h.MaKH)
            .Distinct()
            .CountAsync();
    }

    public async Task<int> CountKhachMoiHomNayAsync(DateOnly ngay)
    {
        var tu = StartOfDay(ngay);
        var den = EndOfDay(ngay);

        return await _context.KhachHangs
            .Where(k => k.NgayDangKy >= tu && k.NgayDangKy <= den)
            .CountAsync();
    }

    #endregion

    #region Top sản phẩm và biểu đồ

    public async Task<List<TopSanPhamDto>> GetTopSanPhamAsync(DateOnly tuNgay, DateOnly denNgay, int limit)
    {
        var tu = StartOfDay(tuNgay);
        var den = EndOfDay(denNgay);

        return await _context.ChiTietHoaDons
            .Where(ct => TrangThaiHoaDonDaThanhToan.Values.Contains(ct.HoaDon.TrangThaiHoaDon)
                && ct.HoaDon.ThoiGianLap >= tu
                && ct.HoaDon.ThoiGianLap <= den)
            .GroupBy(ct => new { ct.MaSanPham, ct.SanPham.TenSanPham })
            .Select(g => new TopSanPhamDto
            {
                TenSanPham = g.Key.TenSanPham,
                SoLuong = g.Sum(x => x.SoLuong),
            })
            .OrderByDescending(x => x.SoLuong)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<List<DoanhThuNgayDto>> GetDoanhThuTheoNgayAsync(DateOnly tuNgay, DateOnly denNgay)
    {
        var tu = StartOfDay(tuNgay);
        var den = EndOfDay(denNgay);

        var raw = await HoaDonDaThanhToan
            .Where(h => h.ThoiGianLap >= tu && h.ThoiGianLap <= den)
            .GroupBy(h => DateOnly.FromDateTime(h.ThoiGianLap))
            .Select(g => new { Ngay = g.Key, DoanhThu = g.Sum(h => h.TongThanhToan) })
            .ToListAsync();

        var result = new List<DoanhThuNgayDto>();

        for (var d = tuNgay; d <= denNgay; d = d.AddDays(1))
        {
            var found = raw.FirstOrDefault(x => x.Ngay == d);
            result.Add(new DoanhThuNgayDto
            {
                Ngay = d,
                Nhan = GetNhanNgay(d),
                DoanhThu = found?.DoanhThu ?? 0,
            });
        }

        return result;
    }

    private static string GetNhanNgay(DateOnly ngay)
    {
        string[] labels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        return labels[(int)ngay.DayOfWeek];
    }

    #endregion

    #region Đơn online và nguyên liệu

    public async Task<int> CountDonOnlineChoXacNhanAsync()
    {
        return await _context.DonHangOnlines
            .CountAsync(d => d.TrangThaiOnline == TrangThaiDonHangOnline.ChoXacNhan);
    }

    public async Task<List<DonOnlineChoDto>> GetDonOnlineChoXacNhanAsync(int limit)
    {
        return await _context.DonHangOnlines
            .Include(d => d.HoaDon)
            .Where(d => d.TrangThaiOnline == TrangThaiDonHangOnline.ChoXacNhan)
            .OrderBy(d => d.HoaDon.ThoiGianLap)
            .Take(limit)
            .Select(d => new DonOnlineChoDto
            {
                MaHoaDon = d.MaHoaDon,
                HoTen = d.HoTenNhanHang,
                TongThanhToan = d.HoaDon.TongThanhToan,
                ThoiGianLap = d.HoaDon.ThoiGianLap,
            })
            .ToListAsync();
    }

    public async Task<List<NguyenLieuCanhBaoDto>> GetNguyenLieuCanhBaoAsync(int limit)
    {
        return await _context.NguyenLieus
            .Where(n => n.TrangThai == "ConHang" && n.SoLuongTon <= n.SoLuongCanhBao)
            .OrderBy(n => n.SoLuongTon)
            .Take(limit)
            .Select(n => new NguyenLieuCanhBaoDto
            {
                MaNL = n.MaNL,
                TenNguyenLieu = n.TenNL,
                SoLuongTon = n.SoLuongTon,
                DonViTinh = n.DonViTinh,
                NguongCanhBao = n.SoLuongCanhBao,
                TrangThai = n.SoLuongTon <= 0 ? "HetHang" : "SapHet",
            })
            .ToListAsync();
    }

    #endregion
}
