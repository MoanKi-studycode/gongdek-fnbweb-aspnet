using GongDek_Nhom20.DTOs.CatalogDtos;

namespace GongDek_Nhom20.Services;

public interface ISanPhamService
{
    Task<List<SanPhamDto>> GetAllAsync(int? maDanhMuc, string? search);
    Task<SanPhamDto?> GetByIdAsync(int id);
    Task<SanPhamDto> CreateAsync(CreateSanPhamDto dto);
    Task<SanPhamDto?> UpdateAsync(int id, UpdateSanPhamDto dto);
    Task<bool> DeleteAsync(int id);
    Task<SanPhamDto?> UploadImageAsync(int id, IFormFile file, IWebHostEnvironment env);
}
