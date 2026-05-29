using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.VoucherDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class VoucherService : IVoucherService
{
    private readonly GongDekDbContext _context;

    public VoucherService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<VoucherDto>> GetAllAsync() =>
        await _context.Vouchers
            .OrderByDescending(v => v.NgayKetThuc)
            .Select(v => Map(v))
            .ToListAsync();

    public async Task<VoucherDto?> GetByCodeAsync(string code)
    {
        var voucher = await _context.Vouchers
            .FirstOrDefaultAsync(v => v.MaCode == code.Trim().ToUpperInvariant());
        return voucher == null ? null : Map(voucher);
    }

    public async Task<VoucherDto?> GetByIdAsync(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        return voucher == null ? null : Map(voucher);
    }

    public async Task<VoucherDto> CreateAsync(CreateVoucherDto dto)
    {
        var code = dto.MaCode.Trim().ToUpperInvariant();
        if (await _context.Vouchers.AnyAsync(v => v.MaCode == code))
            throw new InvalidOperationException("Mã voucher đã tồn tại.");

        var entity = new Voucher
        {
            MaCode = code,
            MoTa = BuildMoTa(dto),
            GiaTriGiam = dto.GiaTriGiam,
            DonHangToiThieu = dto.DonHangToiThieu,
            NgayBatDau = dto.NgayBatDau,
            NgayKetThuc = dto.NgayKetThuc,
            TrangThai = "ConHieuLuc",
        };

        _context.Vouchers.Add(entity);
        await _context.SaveChangesAsync();
        return Map(entity);
    }

    public async Task<VoucherDto> UpdateAsync(int id, UpdateVoucherDto dto)
    {
        var entity = await _context.Vouchers.FindAsync(id)
            ?? throw new KeyNotFoundException($"Không tìm thấy voucher #{id}.");

        entity.MoTa = BuildMoTa(dto);
        entity.GiaTriGiam = dto.GiaTriGiam;
        entity.DonHangToiThieu = dto.DonHangToiThieu;
        entity.NgayBatDau = dto.NgayBatDau;
        entity.NgayKetThuc = dto.NgayKetThuc;
        if (!string.IsNullOrWhiteSpace(dto.TrangThai))
            entity.TrangThai = dto.TrangThai.Trim();

        await _context.SaveChangesAsync();
        return Map(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _context.Vouchers.FindAsync(id)
            ?? throw new KeyNotFoundException($"Không tìm thấy voucher #{id}.");
        entity.TrangThai = "HetHan";
        await _context.SaveChangesAsync();
    }

    public async Task<Voucher?> ResolveValidVoucherAsync(string? maCode, decimal tongTienMon)
    {
        if (string.IsNullOrWhiteSpace(maCode))
            return null;

        var voucher = await _context.Vouchers
            .FirstOrDefaultAsync(v => v.MaCode == maCode.Trim().ToUpperInvariant());

        if (voucher == null || voucher.TrangThai != "ConHieuLuc")
            return null;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (today < voucher.NgayBatDau || today > voucher.NgayKetThuc)
            return null;

        if (OrderPricingHelper.CalculateVoucherDiscount(voucher, tongTienMon) <= 0)
            return null;

        return voucher;
    }

    private static string BuildMoTa(CreateVoucherDto dto)
    {
        var parts = new List<string> { dto.LoaiGiam };
        if (!string.IsNullOrWhiteSpace(dto.MoTa))
            parts.Add(dto.MoTa.Trim());
        if (dto.GiamToiDa.HasValue)
            parts.Add($"GIAM_TOI_DA:{dto.GiamToiDa.Value}");
        return string.Join(" | ", parts);
    }

    private static VoucherDto Map(Voucher v) => new()
    {
        MaVoucher = v.MaVoucher,
        MaCode = v.MaCode,
        MoTa = v.MoTa,
        LoaiGiam = OrderPricingHelper.IsPercentVoucher(v) ? "PHAN_TRAM" : "SO_TIEN",
        GiaTriGiam = v.GiaTriGiam,
        DonHangToiThieu = v.DonHangToiThieu,
        GiamToiDa = OrderPricingHelper.IsPercentVoucher(v)
            ? ParseMaxFromMoTa(v.MoTa)
            : null,
        NgayBatDau = v.NgayBatDau,
        NgayKetThuc = v.NgayKetThuc,
        TrangThai = v.TrangThai,
    };

    private static decimal? ParseMaxFromMoTa(string? moTa)
    {
        if (string.IsNullOrWhiteSpace(moTa)) return null;
        const string prefix = "GIAM_TOI_DA:";
        var idx = moTa.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        var part = moTa[(idx + prefix.Length)..].Split('|', ';')[0].Trim();
        return decimal.TryParse(part, out var val) ? val : null;
    }
}
