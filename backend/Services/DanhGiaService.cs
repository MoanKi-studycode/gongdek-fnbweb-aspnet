using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.DanhGiaDtos;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class DanhGiaService : IDanhGiaService
{
    private readonly GongDekDbContext _context;

    public DanhGiaService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<DanhGiaDto>> GetAllAsync()
    {
        return await _context.DanhGias
            .Include(d => d.KhachHang)
            .Include(d => d.SanPham)
            .OrderByDescending(d => d.NgayDanhGia)
            .Select(d => new DanhGiaDto
            {
                MaDanhGia = d.MaDanhGia,
                MaHoaDon = d.MaHoaDon,
                MaSanPham = d.MaSanPham,
                TenSanPham = d.SanPham.TenSanPham,
                NguoiDung = d.KhachHang != null ? d.KhachHang.HoTen : "Khách ẩn danh",
                SoSao = d.SoSao,
                BinhLuan = d.NoiDung,
                NgayDanhGia = d.NgayDanhGia,
            })
            .ToListAsync();
    }

    public async Task<List<DanhGiaDto>> GetBySanPhamAsync(int maSanPham)
    {
        return await _context.DanhGias
            .Include(d => d.KhachHang)
            .Include(d => d.SanPham)
            .Where(d => d.MaSanPham == maSanPham)
            .OrderByDescending(d => d.NgayDanhGia)
            .Select(d => new DanhGiaDto
            {
                MaDanhGia = d.MaDanhGia,
                MaHoaDon = d.MaHoaDon,
                MaSanPham = d.MaSanPham,
                TenSanPham = d.SanPham.TenSanPham,
                NguoiDung = d.KhachHang != null ? d.KhachHang.HoTen : "Khách ẩn danh",
                SoSao = d.SoSao,
                BinhLuan = d.NoiDung,
                NgayDanhGia = d.NgayDanhGia,
            })
            .ToListAsync();
    }

    public async Task<List<DanhGiaTomTatDto>> GetAllSummariesAsync()
    {
        return await _context.DanhGias
            .GroupBy(d => d.MaSanPham)
            .Select(g => new DanhGiaTomTatDto
            {
                MaSanPham = g.Key,
                SoDanhGia = g.Count(),
                DiemTrungBinh = g.Average(d => (double)d.SoSao),
            })
            .ToListAsync();
    }

    public async Task<DanhGiaTomTatDto?> GetSummaryBySanPhamAsync(int maSanPham)
    {
        var reviews = _context.DanhGias.Where(d => d.MaSanPham == maSanPham);
        if (!await reviews.AnyAsync())
            return null;

        return new DanhGiaTomTatDto
        {
            MaSanPham = maSanPham,
            SoDanhGia = await reviews.CountAsync(),
            DiemTrungBinh = await reviews.AverageAsync(d => (double)d.SoSao),
        };
    }

    public async Task<List<DanhGiaDto>> GetByHoaDonForCustomerAsync(int maKh, int maHoaDon)
    {
        return await _context.DanhGias
            .Include(d => d.KhachHang)
            .Include(d => d.SanPham)
            .Where(d => d.MaKH == maKh && d.MaHoaDon == maHoaDon)
            .OrderByDescending(d => d.NgayDanhGia)
            .Select(d => new DanhGiaDto
            {
                MaDanhGia = d.MaDanhGia,
                MaHoaDon = d.MaHoaDon,
                MaSanPham = d.MaSanPham,
                TenSanPham = d.SanPham.TenSanPham,
                NguoiDung = d.KhachHang != null ? d.KhachHang.HoTen : "Khách ẩn danh",
                SoSao = d.SoSao,
                BinhLuan = d.NoiDung,
                NgayDanhGia = d.NgayDanhGia,
            })
            .ToListAsync();
    }

    public async Task<DanhGiaDto> CreateAsync(int maKh, CreateDanhGiaDto dto)
    {
        if (dto.SoSao < 1 || dto.SoSao > 5)
            throw new InvalidOperationException("Số sao phải từ 1 đến 5.");

        var hoaDon = await _context.HoaDons
            .Include(h => h.ChiTietHoaDons)
            .Include(h => h.DonHangOnline)
            .FirstOrDefaultAsync(h => h.MaHoaDon == dto.MaHoaDon && h.MaKH == maKh);

        if (hoaDon == null)
            throw new InvalidOperationException("Không tìm thấy hóa đơn hoặc bạn không có quyền đánh giá.");

        if (!CanReviewInvoice(hoaDon))
            throw new InvalidOperationException("Chỉ đánh giá được đơn đã hoàn thành.");

        if (!hoaDon.ChiTietHoaDons.Any(c => c.MaSanPham == dto.MaSanPham))
            throw new InvalidOperationException("Sản phẩm không có trong hóa đơn.");

        if (await _context.DanhGias.AnyAsync(d =>
                d.MaHoaDon == dto.MaHoaDon && d.MaSanPham == dto.MaSanPham && d.MaKH == maKh))
            throw new InvalidOperationException("Bạn đã đánh giá sản phẩm này.");

        var sanPham = await _context.SanPhams.FindAsync(dto.MaSanPham)
            ?? throw new InvalidOperationException("Sản phẩm không tồn tại.");

        var entity = new DanhGia
        {
            MaHoaDon = dto.MaHoaDon,
            MaSanPham = dto.MaSanPham,
            MaKH = maKh,
            SoSao = dto.SoSao,
            NoiDung = string.IsNullOrWhiteSpace(dto.NoiDung) ? null : dto.NoiDung.Trim(),
            NgayDanhGia = DateTime.UtcNow,
        };

        _context.DanhGias.Add(entity);
        await _context.SaveChangesAsync();

        var kh = await _context.KhachHangs.FindAsync(maKh);
        return new DanhGiaDto
        {
            MaDanhGia = entity.MaDanhGia,
            MaHoaDon = entity.MaHoaDon,
            MaSanPham = entity.MaSanPham,
            TenSanPham = sanPham.TenSanPham,
            NguoiDung = kh?.HoTen ?? "Khách hàng",
            SoSao = entity.SoSao,
            BinhLuan = entity.NoiDung,
            NgayDanhGia = entity.NgayDanhGia,
        };
    }

    private static bool CanReviewInvoice(HoaDon hoaDon)
    {
        if (hoaDon.TrangThaiHoaDon == TrangThaiHoaDon.HoanThanh)
            return true;

        if (hoaDon.LoaiDon == LoaiDon.Online && hoaDon.DonHangOnline != null)
            return hoaDon.DonHangOnline.TrangThaiOnline == TrangThaiDonHangOnline.HoanThanh;

        return false;
    }
}
