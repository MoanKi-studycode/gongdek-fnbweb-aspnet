using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.KhachHangDtos;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class KhachHangService : IKhachHangService
{
    private readonly GongDekDbContext _context;

    public KhachHangService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<KhachHangDto>> GetAllAsync(string? search)
    {
        var query = _context.KhachHangs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var kw = search.Trim();
            query = query.Where(k =>
                k.HoTen.Contains(kw) ||
                k.SoDienThoai.Contains(kw) ||
                k.Email.Contains(kw));
        }

        var items = await query.OrderByDescending(k => k.NgayDangKy).ToListAsync();
        var result = new List<KhachHangDto>();
        foreach (var k in items)
            result.Add(await MapWithSpentAsync(k));
        return result;
    }

    public async Task<KhachHangDto?> GetByIdAsync(int id)
    {
        var kh = await _context.KhachHangs.FindAsync(id);
        return kh == null ? null : await MapWithSpentAsync(kh);
    }

    public async Task<KhachHangDto?> GetByPhoneAsync(string phone)
    {
        var normalized = phone.Trim();
        var kh = await _context.KhachHangs
            .FirstOrDefaultAsync(k => k.SoDienThoai == normalized);
        return kh == null ? null : await MapWithSpentAsync(kh);
    }

    public async Task<KhachHangDto> CreateAsync(CreateKhachHangDto dto)
    {
        var phone = dto.SoDienThoai.Trim();
        if (await _context.KhachHangs.AnyAsync(k => k.SoDienThoai == phone))
            throw new InvalidOperationException("Số điện thoại đã tồn tại.");

        var email = string.IsNullOrWhiteSpace(dto.Email)
            ? $"kh_{phone}@gongdek.vn"
            : dto.Email.Trim();

        if (await _context.KhachHangs.AnyAsync(k => k.Email == email))
            throw new InvalidOperationException("Email đã tồn tại.");

        var kh = new KhachHang
        {
            HoTen = dto.HoTen.Trim(),
            SoDienThoai = phone,
            Email = email,
            MatKhauHash = PasswordHashHelper.HashPassword("Khachhang@123"),
            HangThanhVien = "ThanhVien",
            DiemTichLuy = 0,
            TrangThai = "HoatDong",
            NgayDangKy = DateTime.UtcNow,
        };

        _context.KhachHangs.Add(kh);
        await _context.SaveChangesAsync();
        return await MapWithSpentAsync(kh);
    }

    public async Task<KhachHangDto> UpdateAsync(int id, UpdateKhachHangDto dto)
    {
        var kh = await _context.KhachHangs.FindAsync(id)
            ?? throw new KeyNotFoundException($"Không tìm thấy khách hàng #{id}.");

        if (!string.IsNullOrWhiteSpace(dto.HoTen))
            kh.HoTen = dto.HoTen.Trim();
        if (!string.IsNullOrWhiteSpace(dto.SoDienThoai))
        {
            var phone = dto.SoDienThoai.Trim();
            if (await _context.KhachHangs.AnyAsync(k => k.SoDienThoai == phone && k.MaKH != id))
                throw new InvalidOperationException("Số điện thoại đã được sử dụng.");
            kh.SoDienThoai = phone;
        }
        if (!string.IsNullOrWhiteSpace(dto.Email))
            kh.Email = dto.Email.Trim();
        if (!string.IsNullOrWhiteSpace(dto.HangThanhVien))
            kh.HangThanhVien = dto.HangThanhVien.Trim();
        if (dto.DiemTichLuy.HasValue)
            kh.DiemTichLuy = Math.Max(0, dto.DiemTichLuy.Value);
        if (!string.IsNullOrWhiteSpace(dto.TrangThai))
            kh.TrangThai = dto.TrangThai.Trim();

        await _context.SaveChangesAsync();
        return await MapWithSpentAsync(kh);
    }

    public async Task DeleteAsync(int id)
    {
        var kh = await _context.KhachHangs.FindAsync(id)
            ?? throw new KeyNotFoundException($"Không tìm thấy khách hàng #{id}.");
        kh.TrangThai = "Khoa";
        await _context.SaveChangesAsync();
    }

    private static KhachHangDto MapToDto(KhachHang k) => new()
    {
        MaKH = k.MaKH,
        HoTen = k.HoTen,
        SoDienThoai = k.SoDienThoai,
        Email = k.Email,
        HangThanhVien = k.HangThanhVien,
        DiemTichLuy = k.DiemTichLuy,
        TrangThai = k.TrangThai,
        TongChiTieu = 0,
    };

    private async Task<KhachHangDto> MapWithSpentAsync(KhachHang k)
    {
        var spent = await _context.HoaDons
            .Where(h => h.MaKH == k.MaKH && h.TrangThaiHoaDon != TrangThaiHoaDon.DaHuy)
            .SumAsync(h => (decimal?)h.TongThanhToan) ?? 0;

        var dto = MapToDto(k);
        dto.TongChiTieu = spent;
        return dto;
    }
}
