using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>API read-only tối thiểu — topping.</summary>
public class ToppingService : IToppingService
{
    private readonly GongDekDbContext _context;

    public ToppingService(GongDekDbContext context)
    {
        _context = context;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Trần Quốc Tiên]: Hoàn thiện CRUD và nghiệp vụ quản lý sản phẩm sau.
    public async Task<List<ToppingDto>> GetAllAsync()
    {
        return await _context.Toppings
            .OrderBy(t => t.TenTopping)
            .Select(t => new ToppingDto
            {
                MaTopping = t.MaTopping,
                TenTopping = t.TenTopping,
                DonGia = t.DonGia,
                TrangThai = t.TrangThai,
            })
            .ToListAsync();
    }
}
