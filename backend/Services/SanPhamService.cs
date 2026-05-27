using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.CatalogDtos;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class SanPhamService : ISanPhamService
{
    private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "DangBan",
        "NgungBan",
        "HetHang"
    };

    private readonly GongDekDbContext _context;

    public SanPhamService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<SanPhamDto>> GetAllAsync(int? maDanhMuc, string? search)
    {
        var query = _context.SanPhams
            .Include(s => s.DanhMuc)
            .AsQueryable();

        if (maDanhMuc.HasValue)
        {
            query = query.Where(s => s.MaDanhMuc == maDanhMuc.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(s =>
                s.TenSanPham.Contains(keyword) ||
                (s.MoTa != null && s.MoTa.Contains(keyword)) ||
                s.DanhMuc.TenDanhMuc.Contains(keyword));
        }

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
                GhiChuPhaChe = s.GhiChuPhaChe,
                TrangThai = s.TrangThai,
            })
            .ToListAsync();
    }

    public async Task<SanPhamDto?> GetByIdAsync(int id)
    {
        return await _context.SanPhams
            .Include(s => s.DanhMuc)
            .Where(s => s.MaSanPham == id)
            .Select(s => new SanPhamDto
            {
                MaSanPham = s.MaSanPham,
                TenSanPham = s.TenSanPham,
                MaDanhMuc = s.MaDanhMuc,
                TenDanhMuc = s.DanhMuc.TenDanhMuc,
                MoTa = s.MoTa,
                GiaBanGoc = s.GiaBanGoc,
                HinhAnh = s.HinhAnh,
                GhiChuPhaChe = s.GhiChuPhaChe,
                TrangThai = s.TrangThai,
            })
            .FirstOrDefaultAsync();
    }

    public async Task<SanPhamDto> CreateAsync(CreateSanPhamDto dto)
    {
        await ValidatePayloadAsync(dto.TenSanPham, dto.MaDanhMuc, dto.GiaBanGoc, dto.TrangThai);

        var entity = new SanPham
        {
            MaDanhMuc = dto.MaDanhMuc,
            TenSanPham = dto.TenSanPham.Trim(),
            MoTa = NormalizeNullable(dto.MoTa),
            HinhAnh = NormalizeNullable(dto.HinhAnh),
            GiaBanGoc = dto.GiaBanGoc,
            GhiChuPhaChe = NormalizeNullable(dto.GhiChuPhaChe),
            TrangThai = NormalizeStatus(dto.TrangThai),
        };

        await _context.SanPhams.AddAsync(entity);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(entity.MaSanPham))!;
    }

    public async Task<SanPhamDto?> UpdateAsync(int id, UpdateSanPhamDto dto)
    {
        var entity = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSanPham == id);
        if (entity == null)
        {
            return null;
        }

        await ValidatePayloadAsync(dto.TenSanPham, dto.MaDanhMuc, dto.GiaBanGoc, dto.TrangThai, id);

        entity.MaDanhMuc = dto.MaDanhMuc;
        entity.TenSanPham = dto.TenSanPham.Trim();
        entity.MoTa = NormalizeNullable(dto.MoTa);
        entity.HinhAnh = NormalizeNullable(dto.HinhAnh);
        entity.GiaBanGoc = dto.GiaBanGoc;
        entity.GhiChuPhaChe = NormalizeNullable(dto.GhiChuPhaChe);
        entity.TrangThai = NormalizeStatus(dto.TrangThai);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSanPham == id);
        if (entity == null)
        {
            return false;
        }

        var hasInvoiceDetail = await _context.ChiTietHoaDons.AnyAsync(ct => ct.MaSanPham == id);
        var hasReview = await _context.DanhGias.AnyAsync(dg => dg.MaSanPham == id);
        if (hasInvoiceDetail || hasReview)
        {
            throw new InvalidOperationException("Không thể xóa sản phẩm đã phát sinh hóa đơn hoặc đánh giá. Hãy chuyển trạng thái sang Ngưng bán/Hết hàng.");
        }

        _context.SanPhams.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<SanPhamDto?> UploadImageAsync(int id, IFormFile file, IWebHostEnvironment env)
    {
        var entity = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSanPham == id);
        if (entity == null)
        {
            return null;
        }

        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("Vui lòng chọn file ảnh.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is not ".jpg" and not ".jpeg" and not ".png" and not ".webp")
        {
            throw new ArgumentException("Chỉ chấp nhận ảnh jpg, png hoặc webp.");
        }

        var extForFile = extension == ".jpeg" ? "jpg" : extension.TrimStart('.');
        ProductImagePaths.EnsureStorageDirectory(env);
        var directory = ProductImagePaths.GetPhysicalDirectory(env);

        foreach (var oldFile in Directory.GetFiles(directory, $"{id}.*"))
        {
            File.Delete(oldFile);
        }

        var physicalPath = ProductImagePaths.GetPhysicalPath(env, id, extForFile);
        await using (var stream = new FileStream(physicalPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        entity.HinhAnh = ProductImagePaths.BuildUrl(id, extForFile);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    private async Task ValidatePayloadAsync(string? tenSanPham, int maDanhMuc, decimal giaBanGoc, string? trangThai, int? currentId = null)
    {
        if (string.IsNullOrWhiteSpace(tenSanPham))
        {
            throw new ArgumentException("Tên sản phẩm không được để trống.");
        }

        if (giaBanGoc < 0)
        {
            throw new ArgumentException("Giá bán gốc không được âm.");
        }

        var normalizedStatus = NormalizeStatus(trangThai);
        if (!ValidStatuses.Contains(normalizedStatus))
        {
            throw new ArgumentException("Trạng thái sản phẩm chỉ được là DangBan, NgungBan hoặc HetHang.");
        }

        var categoryExists = await _context.DanhMucs.AnyAsync(dm => dm.MaDanhMuc == maDanhMuc);
        if (!categoryExists)
        {
            throw new ArgumentException("Danh mục sản phẩm không tồn tại.");
        }

        var normalizedName = tenSanPham.Trim();
        var isDuplicate = await _context.SanPhams.AnyAsync(s =>
            s.TenSanPham == normalizedName &&
            (!currentId.HasValue || s.MaSanPham != currentId.Value));

        if (isDuplicate)
        {
            throw new InvalidOperationException("Tên sản phẩm đã tồn tại.");
        }
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string NormalizeStatus(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? "DangBan" : value.Trim();
    }

}
