using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>API read-only tối thiểu — hóa đơn.</summary>
public class HoaDonReadService : IHoaDonReadService
{
    private readonly GongDekDbContext _context;

    public HoaDonReadService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<HoaDonListDto>> GetAllAsync(string? trangThai, DateOnly? tuNgay, DateOnly? denNgay)
    {
        var query = _context.HoaDons
            .Include(h => h.KhachHang)
            .Include(h => h.NhanVienLap)
            .Include(h => h.DonHangOnline)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(trangThai))
            query = query.Where(h => h.TrangThaiHoaDon == trangThai);

        if (tuNgay.HasValue)
        {
            var tu = tuNgay.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(h => h.ThoiGianLap >= tu);
        }

        if (denNgay.HasValue)
        {
            var den = denNgay.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(h => h.ThoiGianLap <= den);
        }

        return await query
            .OrderByDescending(h => h.ThoiGianLap)
            .Select(h => new HoaDonListDto
            {
                MaHoaDon = h.MaHoaDon,
                LoaiDon = h.LoaiDon,
                TrangThaiHoaDon = h.TrangThaiHoaDon,
                TrangThaiOnline = h.DonHangOnline != null ? h.DonHangOnline.TrangThaiOnline : null,
                TenKhachHang = h.KhachHang != null
                    ? h.KhachHang.HoTen
                    : h.DonHangOnline != null ? h.DonHangOnline.HoTenNhanHang : null,
                SoDienThoaiKhach = h.KhachHang != null
                    ? h.KhachHang.SoDienThoai
                    : h.DonHangOnline != null ? h.DonHangOnline.SoDienThoaiNhan : null,
                TenNhanVienLap = h.NhanVienLap.HoTen,
                ThoiGianLap = h.ThoiGianLap,
                TongThanhToan = h.TongThanhToan,
                PhuongThucThanhToan = h.PhuongThucThanhToan,
            })
            .ToListAsync();
    }

    public async Task<List<HoaDonListDto>> GetByKhachHangAsync(int maKh, int? limit = null)
    {
        IQueryable<HoaDon> query = _context.HoaDons
            .Where(h => h.MaKH == maKh)
            .OrderByDescending(h => h.ThoiGianLap);

        if (limit is > 0)
            query = query.Take(limit.Value);

        return await query
            .Select(h => new HoaDonListDto
            {
                MaHoaDon = h.MaHoaDon,
                LoaiDon = h.LoaiDon,
                TrangThaiHoaDon = h.TrangThaiHoaDon,
                TrangThaiOnline = h.DonHangOnline != null ? h.DonHangOnline.TrangThaiOnline : null,
                TenKhachHang = h.KhachHang != null ? h.KhachHang.HoTen : null,
                SoDienThoaiKhach = h.KhachHang != null ? h.KhachHang.SoDienThoai : null,
                TenNhanVienLap = h.NhanVienLap.HoTen,
                ThoiGianLap = h.ThoiGianLap,
                TongThanhToan = h.TongThanhToan,
                PhuongThucThanhToan = h.PhuongThucThanhToan,
            })
            .ToListAsync();
    }

    public async Task<HoaDonDetailDto> GetByIdAsync(int id)
    {
        var hoaDon = await _context.HoaDons
            .Include(h => h.KhachHang)
            .Include(h => h.NhanVienLap)
            .Include(h => h.DonHangOnline)
            .Include(h => h.ChiTietHoaDons)
                .ThenInclude(ct => ct.SanPham)
            .Include(h => h.ChiTietHoaDons)
                .ThenInclude(ct => ct.Size)
            .Include(h => h.ChiTietHoaDons)
                .ThenInclude(ct => ct.ChiTietHoaDonToppings)
                    .ThenInclude(t => t.Topping)
            .FirstOrDefaultAsync(h => h.MaHoaDon == id);

        if (hoaDon == null)
            throw new KeyNotFoundException($"Không tìm thấy hóa đơn #{id}.");

        return MapDetail(hoaDon);
    }

    public async Task<HoaDonDetailDto> GetByIdForKhachHangAsync(int maKh, int id)
    {
        var hoaDon = await _context.HoaDons
            .Include(h => h.KhachHang)
            .Include(h => h.NhanVienLap)
            .Include(h => h.DonHangOnline)
            .Include(h => h.ChiTietHoaDons)
                .ThenInclude(ct => ct.SanPham)
            .Include(h => h.ChiTietHoaDons)
                .ThenInclude(ct => ct.Size)
            .Include(h => h.ChiTietHoaDons)
                .ThenInclude(ct => ct.ChiTietHoaDonToppings)
                    .ThenInclude(t => t.Topping)
            .FirstOrDefaultAsync(h => h.MaHoaDon == id && h.MaKH == maKh);

        if (hoaDon == null)
            throw new KeyNotFoundException($"Không tìm thấy hóa đơn #{id}.");

        return MapDetail(hoaDon);
    }

    private static HoaDonDetailDto MapDetail(HoaDon h)
    {
        var tenKhach = h.KhachHang?.HoTen ?? h.DonHangOnline?.HoTenNhanHang;
        var sdt = h.KhachHang?.SoDienThoai ?? h.DonHangOnline?.SoDienThoaiNhan;

        return new HoaDonDetailDto
        {
            MaHoaDon = h.MaHoaDon,
            LoaiDon = h.LoaiDon,
            TrangThaiHoaDon = h.TrangThaiHoaDon,
            TenKhachHang = tenKhach,
            SoDienThoaiKhach = sdt,
            TenNhanVienLap = h.NhanVienLap.HoTen,
            ThoiGianLap = h.ThoiGianLap,
            TongTienMon = h.TongTienMon,
            TienGiamGia = h.TienGiamGia,
            PhiGiaoHang = h.PhiGiaoHang,
            TongThanhToan = h.TongThanhToan,
            PhuongThucThanhToan = h.PhuongThucThanhToan,
            GhiChu = h.GhiChu,
            ChiTiet = h.ChiTietHoaDons.Select(ct => new ChiTietHoaDonDto
            {
                MaChiTiet = ct.MaChiTiet,
                MaSanPham = ct.MaSanPham,
                TenSanPham = ct.SanPham.TenSanPham,
                MaSize = ct.MaSize,
                TenSize = ct.Size.TenSize,
                SoLuong = ct.SoLuong,
                DonGiaGoc = ct.DonGiaGoc,
                PhuThuSize = ct.PhuThuSize,
                ThanhTien = ct.ThanhTien,
                GhiChu = ct.GhiChu,
                Toppings = ct.ChiTietHoaDonToppings.Select(t => new ChiTietToppingDto
                {
                    MaTopping = t.MaTopping,
                    TenTopping = t.Topping.TenTopping,
                    DonGiaTopping = t.DonGiaTopping,
                    SoLuong = t.SoLuong,
                }).ToList(),
            }).ToList(),
        };
    }
}
