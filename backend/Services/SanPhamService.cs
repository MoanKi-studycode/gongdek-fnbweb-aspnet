using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>API read-only tối thiểu — sản phẩm.</summary>
public class SanPhamService : ISanPhamService
{
    private readonly GongDekDbContext _context;

    public SanPhamService(GongDekDbContext context)
    {
        _context = context;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Trần Quốc Tiên]: Hoàn thiện CRUD và nghiệp vụ quản lý sản phẩm sau.
    public async Task<List<SanPhamDto>> GetAllAsync(int? maDanhMuc)
    {
        var query = _context.SanPhams
            .Include(s => s.DanhMuc)
            .AsQueryable();

        if (maDanhMuc.HasValue)
            query = query.Where(s => s.MaDanhMuc == maDanhMuc.Value);

        return await query
            .OrderBy(s => s.TenSanPham)
            .Select(s => new SanPhamDto
            {
                MaSanPham = s.MaSanPham,
                TenSanPham = s.TenSanPham,
                MaDanhMuc = s.MaDanhMuc,
                TenDanhMuc = s.DanhMuc.TenDanhMuc,
                MoTa = s.MoTa,
                GiaBanGoc = s.GiaBanGoc,
                HinhAnh = s.HinhAnh,
                TrangThai = s.TrangThai,
            })
            .ToListAsync();
    }
}
