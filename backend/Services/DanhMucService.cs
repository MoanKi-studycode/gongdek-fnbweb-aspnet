using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>API read-only tối thiểu — danh mục sản phẩm.</summary>
public class DanhMucService : IDanhMucService
{
    private readonly GongDekDbContext _context;

    public DanhMucService(GongDekDbContext context)
    {
        _context = context;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Trần Quốc Tiên]: Hoàn thiện CRUD và nghiệp vụ quản lý sản phẩm sau.
    public async Task<List<DanhMucDto>> GetAllAsync()
    {
        return await _context.DanhMucs
            .OrderBy(d => d.ThuTuHienThi)
            .Select(d => new DanhMucDto
            {
                MaDanhMuc = d.MaDanhMuc,
                TenDanhMuc = d.TenDanhMuc,
                MoTa = d.MoTa,
                TrangThai = d.TrangThai,
            })
            .ToListAsync();
    }
}
