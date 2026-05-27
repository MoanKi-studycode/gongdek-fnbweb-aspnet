using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class DanhMucService : IDanhMucService
{
    private readonly GongDekDbContext _context;

    public DanhMucService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<DanhMucDto>> GetAllAsync()
    {
        return await _context.DanhMucs
            .AsNoTracking()
            .OrderBy(d => d.ThuTuHienThi)
            .ThenBy(d => d.MaDanhMuc)
            .Select(d => new DanhMucDto
            {
                MaDanhMuc = d.MaDanhMuc,
                TenDanhMuc = d.TenDanhMuc,
                MoTa = d.MoTa,
                ThuTuHienThi = d.ThuTuHienThi,
                TrangThai = d.TrangThai,
                SoLuongSanPham = d.SanPhams.Count
            })
            .ToListAsync();
    }

    public async Task<DanhMucDto> CreateAsync(CreateDanhMucDto dto)
    {
        var tenDanhMuc = dto.TenDanhMuc.Trim();

        var isDuplicated = await _context.DanhMucs
            .AnyAsync(d => d.TenDanhMuc == tenDanhMuc);

        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên danh mục đã tồn tại.");
        }

        var entity = new DanhMuc
        {
            TenDanhMuc = tenDanhMuc,
            MoTa = string.IsNullOrWhiteSpace(dto.MoTa) ? null : dto.MoTa.Trim(),
            ThuTuHienThi = dto.ThuTuHienThi,
            TrangThai = dto.TrangThai
        };

        _context.DanhMucs.Add(entity);
        await _context.SaveChangesAsync();

        return ToDto(entity, 0);
    }

    public async Task<DanhMucDto?> UpdateAsync(int id, UpdateDanhMucDto dto)
    {
        var entity = await _context.DanhMucs
            .Include(d => d.SanPhams)
            .FirstOrDefaultAsync(d => d.MaDanhMuc == id);

        if (entity == null) return null;

        var tenDanhMuc = dto.TenDanhMuc.Trim();
        var isDuplicated = await _context.DanhMucs
            .AnyAsync(d => d.MaDanhMuc != id && d.TenDanhMuc == tenDanhMuc);

        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên danh mục đã tồn tại.");
        }

        entity.TenDanhMuc = tenDanhMuc;
        entity.MoTa = string.IsNullOrWhiteSpace(dto.MoTa) ? null : dto.MoTa.Trim();
        entity.ThuTuHienThi = dto.ThuTuHienThi;
        entity.TrangThai = dto.TrangThai;

        await _context.SaveChangesAsync();

        return ToDto(entity, entity.SanPhams.Count);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.DanhMucs
            .Include(d => d.SanPhams)
            .FirstOrDefaultAsync(d => d.MaDanhMuc == id);

        if (entity == null) return false;

        if (entity.SanPhams.Any())
        {
            throw new InvalidOperationException("Không thể xóa danh mục đang có sản phẩm. Hãy chuyển trạng thái sang Ẩn nếu không muốn hiển thị.");
        }

        _context.DanhMucs.Remove(entity);
        await _context.SaveChangesAsync();

        return true;
    }

    private static DanhMucDto ToDto(DanhMuc d, int soLuongSanPham)
    {
        return new DanhMucDto
        {
            MaDanhMuc = d.MaDanhMuc,
            TenDanhMuc = d.TenDanhMuc,
            MoTa = d.MoTa,
            ThuTuHienThi = d.ThuTuHienThi,
            TrangThai = d.TrangThai,
            SoLuongSanPham = soLuongSanPham
        };
    }
}
