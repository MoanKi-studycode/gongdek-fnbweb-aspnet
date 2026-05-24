using GongDek_Nhom20.DTOs.CatalogDtos;

namespace GongDek_Nhom20.Services;

public interface ISanPhamService
{
    Task<List<SanPhamDto>> GetAllAsync(int? maDanhMuc);
}
