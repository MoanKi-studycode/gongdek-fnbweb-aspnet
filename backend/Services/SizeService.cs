using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class SizeService : ISizeService
{
    private static readonly string[] ValidStatuses = { "DangApDung", "NgungApDung" };
    private readonly GongDekDbContext _context;

    public SizeService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<SizeDto>> GetAllAsync()
    {
        return await _context.Sizes
            .AsNoTracking()
            .OrderBy(s => s.PhuThu)
            .ThenBy(s => s.MaSize)
            .Select(s => new SizeDto
            {
                MaSize = s.MaSize,
                TenSize = s.TenSize,
                PhuThu = s.PhuThu,
                TrangThai = s.TrangThai,
            })
            .ToListAsync();
    }

    public async Task<SizeDto> CreateAsync(CreateSizeDto dto)
    {
        Validate(dto.TenSize, dto.PhuThu, dto.TrangThai);
        var tenSize = dto.TenSize.Trim();

        var isDuplicated = await _context.Sizes
            .AnyAsync(s => s.TenSize == tenSize);

        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên size đã tồn tại.");
        }

        var entity = new Size
        {
            TenSize = tenSize,
            PhuThu = dto.PhuThu,
            TrangThai = dto.TrangThai
        };

        _context.Sizes.Add(entity);
        await _context.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<SizeDto?> UpdateAsync(int id, UpdateSizeDto dto)
    {
        Validate(dto.TenSize, dto.PhuThu, dto.TrangThai);

        var entity = await _context.Sizes.FirstOrDefaultAsync(s => s.MaSize == id);
        if (entity == null) return null;

        var tenSize = dto.TenSize.Trim();
        var isDuplicated = await _context.Sizes
            .AnyAsync(s => s.MaSize != id && s.TenSize == tenSize);

        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên size đã tồn tại.");
        }

        entity.TenSize = tenSize;
        entity.PhuThu = dto.PhuThu;
        entity.TrangThai = dto.TrangThai;

        await _context.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Sizes.FirstOrDefaultAsync(s => s.MaSize == id);
        if (entity == null) return false;

        var isUsed = await _context.ChiTietHoaDons.AnyAsync(ct => ct.MaSize == id);
        if (isUsed)
        {
            throw new InvalidOperationException("Không thể xóa size đã phát sinh hóa đơn. Hãy chuyển trạng thái sang Ngưng áp dụng.");
        }

        _context.Sizes.Remove(entity);
        await _context.SaveChangesAsync();

        return true;
    }

    private static void Validate(string? tenSize, decimal phuThu, string? trangThai)
    {
        if (string.IsNullOrWhiteSpace(tenSize))
        {
            throw new InvalidOperationException("Tên size không được để trống.");
        }

        if (tenSize.Trim().Length > 10)
        {
            throw new InvalidOperationException("Tên size không được vượt quá 10 ký tự.");
        }

        if (phuThu < 0)
        {
            throw new InvalidOperationException("Phụ thu size không được âm.");
        }

        if (string.IsNullOrWhiteSpace(trangThai) || !ValidStatuses.Contains(trangThai))
        {
            throw new InvalidOperationException("Trạng thái size chỉ được là DangApDung hoặc NgungApDung.");
        }
    }

    private static SizeDto ToDto(Size size)
    {
        return new SizeDto
        {
            MaSize = size.MaSize,
            TenSize = size.TenSize,
            PhuThu = size.PhuThu,
            TrangThai = size.TrangThai,
        };
    }
}
