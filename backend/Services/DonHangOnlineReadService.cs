using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.OrderReadDtos;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>API read-only tối thiểu — đơn hàng online.</summary>
public class DonHangOnlineReadService : IDonHangOnlineReadService
{
    private readonly GongDekDbContext _context;
    private readonly IHoaDonReadService _hoaDonReadService;

    public DonHangOnlineReadService(GongDekDbContext context, IHoaDonReadService hoaDonReadService)
    {
        _context = context;
        _hoaDonReadService = hoaDonReadService;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Nguyễn Hoài Phương]: Hoàn thiện nghiệp vụ hóa đơn / đơn online sau.
    public async Task<List<DonHangOnlineListDto>> GetAllAsync(string? trangThai)
    {
        var query = _context.DonHangOnlines
            .Include(d => d.HoaDon)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(trangThai))
            query = query.Where(d => d.TrangThaiOnline == trangThai);

        return await query
            .OrderByDescending(d => d.HoaDon.ThoiGianLap)
            .Select(d => new DonHangOnlineListDto
            {
                MaHoaDon = d.MaHoaDon,
                HoTenNhanHang = d.HoTenNhanHang,
                SoDienThoaiNhan = d.SoDienThoaiNhan,
                DiaChiGiao = d.DiaChiGiao,
                TrangThaiOnline = d.TrangThaiOnline,
                TongThanhToan = d.HoaDon.TongThanhToan,
                ThoiGianLap = d.HoaDon.ThoiGianLap,
                ThoiGianXacNhan = d.ThoiGianXacNhan,
                ThoiGianHoanThanh = d.ThoiGianHoanThanh,
            })
            .ToListAsync();
    }

    public async Task<DonHangOnlineDetailDto> GetByIdAsync(int id)
    {
        var don = await _context.DonHangOnlines
            .FirstOrDefaultAsync(d => d.MaHoaDon == id);

        if (don == null)
            throw new KeyNotFoundException($"Không tìm thấy đơn online #{id}.");

        var hoaDon = await _hoaDonReadService.GetByIdAsync(id);

        return new DonHangOnlineDetailDto
        {
            MaHoaDon = don.MaHoaDon,
            HoTenNhanHang = don.HoTenNhanHang,
            SoDienThoaiNhan = don.SoDienThoaiNhan,
            DiaChiGiao = don.DiaChiGiao,
            GhiChuGiaoHang = don.GhiChuGiaoHang,
            TrangThaiOnline = don.TrangThaiOnline,
            ThoiGianXacNhan = don.ThoiGianXacNhan,
            ThoiGianHoanThanh = don.ThoiGianHoanThanh,
            LyDoHuy = don.LyDoHuy,
            HoaDon = hoaDon,
        };
    }
}
