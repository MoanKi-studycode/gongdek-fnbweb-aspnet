using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>API read-only tối thiểu — size sản phẩm.</summary>
public class SizeService : ISizeService
{
    private readonly GongDekDbContext _context;

    public SizeService(GongDekDbContext context)
    {
        _context = context;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Trần Quốc Tiên]: Hoàn thiện CRUD và nghiệp vụ quản lý sản phẩm sau.
    public async Task<List<SizeDto>> GetAllAsync()
    {
        return await _context.Sizes
            .OrderBy(s => s.TenSize)
            .Select(s => new SizeDto
            {
                MaSize = s.MaSize,
                TenSize = s.TenSize,
                PhuThu = s.PhuThu,
                TrangThai = s.TrangThai,
            })
            .ToListAsync();
    }
}
