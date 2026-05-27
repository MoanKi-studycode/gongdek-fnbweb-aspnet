using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class ToppingService : IToppingService
{
    private static readonly string[] ValidStatuses = { "DangBan", "NgungBan" };
    private readonly GongDekDbContext _context;

    public ToppingService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<ToppingDto>> GetAllAsync()
    {
        return await _context.Toppings
            .AsNoTracking()
            .OrderBy(t => t.TenTopping)
            .ThenBy(t => t.MaTopping)
            .Select(t => new ToppingDto
            {
                MaTopping = t.MaTopping,
                TenTopping = t.TenTopping,
                DonGia = t.DonGia,
                TrangThai = t.TrangThai,
            })
            .ToListAsync();
    }

    public async Task<ToppingDto> CreateAsync(CreateToppingDto dto)
    {
        Validate(dto.TenTopping, dto.DonGia, dto.TrangThai);
        var tenTopping = dto.TenTopping.Trim();

        var isDuplicated = await _context.Toppings
            .AnyAsync(t => t.TenTopping == tenTopping);

        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên topping đã tồn tại.");
        }

        var entity = new Topping
        {
            TenTopping = tenTopping,
            DonGia = dto.DonGia,
            TrangThai = dto.TrangThai
        };

        _context.Toppings.Add(entity);
        await _context.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<ToppingDto?> UpdateAsync(int id, UpdateToppingDto dto)
    {
        Validate(dto.TenTopping, dto.DonGia, dto.TrangThai);

        var entity = await _context.Toppings.FirstOrDefaultAsync(t => t.MaTopping == id);
        if (entity == null) return null;

        var tenTopping = dto.TenTopping.Trim();
        var isDuplicated = await _context.Toppings
            .AnyAsync(t => t.MaTopping != id && t.TenTopping == tenTopping);

        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên topping đã tồn tại.");
        }

        entity.TenTopping = tenTopping;
        entity.DonGia = dto.DonGia;
        entity.TrangThai = dto.TrangThai;

        await _context.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Toppings.FirstOrDefaultAsync(t => t.MaTopping == id);
        if (entity == null) return false;

        var isUsed = await _context.ChiTietHoaDonToppings.AnyAsync(ct => ct.MaTopping == id);
        if (isUsed)
        {
            throw new InvalidOperationException("Không thể xóa topping đã phát sinh hóa đơn. Hãy chuyển trạng thái sang Ngưng bán.");
        }

        _context.Toppings.Remove(entity);
        await _context.SaveChangesAsync();

        return true;
    }

    private static void Validate(string? tenTopping, decimal donGia, string? trangThai)
    {
        if (string.IsNullOrWhiteSpace(tenTopping))
        {
            throw new InvalidOperationException("Tên topping không được để trống.");
        }

        if (tenTopping.Trim().Length > 100)
        {
            throw new InvalidOperationException("Tên topping không được vượt quá 100 ký tự.");
        }

        if (donGia < 0)
        {
            throw new InvalidOperationException("Đơn giá topping không được âm.");
        }

        if (string.IsNullOrWhiteSpace(trangThai) || !ValidStatuses.Contains(trangThai))
        {
            throw new InvalidOperationException("Trạng thái topping chỉ được là DangBan hoặc NgungBan.");
        }
    }

    private static ToppingDto ToDto(Topping topping)
    {
        return new ToppingDto
        {
            MaTopping = topping.MaTopping,
            TenTopping = topping.TenTopping,
            DonGia = topping.DonGia,
            TrangThai = topping.TrangThai,
        };
    }
}
