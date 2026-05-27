using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.InventoryDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class NhaCungCapService : INhaCungCapService
{
    private static readonly string[] ValidStatuses = { "DangHopTac", "NgungHopTac" };
    private readonly GongDekDbContext _context;

    public NhaCungCapService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<NhaCungCapDto>> GetAllAsync(string? search = null)
    {
        var query = _context.NhaCungCaps
            .AsNoTracking()
            .Include(n => n.PhieuNhapKhos)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(n =>
                n.TenNCC.Contains(keyword) ||
                (n.SoDienThoai != null && n.SoDienThoai.Contains(keyword)) ||
                (n.Email != null && n.Email.Contains(keyword)) ||
                (n.NguoiLienHe != null && n.NguoiLienHe.Contains(keyword)));
        }

        return await query
            .OrderBy(n => n.TenNCC)
            .Select(n => ToDto(n))
            .ToListAsync();
    }

    public async Task<NhaCungCapDto?> GetByIdAsync(int id)
    {
        return await _context.NhaCungCaps
            .AsNoTracking()
            .Include(n => n.PhieuNhapKhos)
            .Where(n => n.MaNCC == id)
            .Select(n => ToDto(n))
            .FirstOrDefaultAsync();
    }

    public async Task<NhaCungCapDto> CreateAsync(CreateNhaCungCapDto dto)
    {
        Validate(dto);
        var tenNCC = dto.TenNCC.Trim();

        var isDuplicated = await _context.NhaCungCaps.AnyAsync(n => n.TenNCC == tenNCC);
        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên nhà cung cấp đã tồn tại.");
        }

        var entity = new NhaCungCap
        {
            TenNCC = tenNCC,
            SoDienThoai = Normalize(dto.SoDienThoai),
            DiaChi = Normalize(dto.DiaChi),
            Email = Normalize(dto.Email),
            NguoiLienHe = Normalize(dto.NguoiLienHe),
            TrangThai = dto.TrangThai
        };

        _context.NhaCungCaps.Add(entity);
        await _context.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<NhaCungCapDto?> UpdateAsync(int id, UpdateNhaCungCapDto dto)
    {
        Validate(dto);

        var entity = await _context.NhaCungCaps
            .Include(n => n.PhieuNhapKhos)
            .FirstOrDefaultAsync(n => n.MaNCC == id);
        if (entity == null) return null;

        var tenNCC = dto.TenNCC.Trim();
        var isDuplicated = await _context.NhaCungCaps.AnyAsync(n => n.MaNCC != id && n.TenNCC == tenNCC);
        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên nhà cung cấp đã tồn tại.");
        }

        entity.TenNCC = tenNCC;
        entity.SoDienThoai = Normalize(dto.SoDienThoai);
        entity.DiaChi = Normalize(dto.DiaChi);
        entity.Email = Normalize(dto.Email);
        entity.NguoiLienHe = Normalize(dto.NguoiLienHe);
        entity.TrangThai = dto.TrangThai;

        await _context.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.NhaCungCaps
            .Include(n => n.PhieuNhapKhos)
            .FirstOrDefaultAsync(n => n.MaNCC == id);
        if (entity == null) return false;

        if (entity.PhieuNhapKhos.Any())
        {
            throw new InvalidOperationException("Không thể xóa nhà cung cấp đã có phiếu nhập kho. Hãy chuyển trạng thái sang Ngừng hợp tác.");
        }

        _context.NhaCungCaps.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    private static void Validate(CreateNhaCungCapDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TenNCC))
        {
            throw new InvalidOperationException("Tên nhà cung cấp không được để trống.");
        }

        if (dto.TenNCC.Trim().Length > 150)
        {
            throw new InvalidOperationException("Tên nhà cung cấp không được vượt quá 150 ký tự.");
        }

        if (!string.IsNullOrWhiteSpace(dto.SoDienThoai) && dto.SoDienThoai.Trim().Length > 15)
        {
            throw new InvalidOperationException("Số điện thoại không được vượt quá 15 ký tự.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email.Trim().Length > 100)
        {
            throw new InvalidOperationException("Email không được vượt quá 100 ký tự.");
        }

        if (string.IsNullOrWhiteSpace(dto.TrangThai) || !ValidStatuses.Contains(dto.TrangThai))
        {
            throw new InvalidOperationException("Trạng thái nhà cung cấp chỉ được là DangHopTac hoặc NgungHopTac.");
        }
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static NhaCungCapDto ToDto(NhaCungCap entity)
    {
        return new NhaCungCapDto
        {
            MaNCC = entity.MaNCC,
            TenNCC = entity.TenNCC,
            SoDienThoai = entity.SoDienThoai,
            DiaChi = entity.DiaChi,
            Email = entity.Email,
            NguoiLienHe = entity.NguoiLienHe,
            TrangThai = entity.TrangThai,
            SoPhieuNhap = entity.PhieuNhapKhos?.Count ?? 0
        };
    }
}
