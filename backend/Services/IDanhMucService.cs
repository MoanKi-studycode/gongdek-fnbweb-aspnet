using GongDek_Nhom20.DTOs.CatalogDtos;

namespace GongDek_Nhom20.Services;

public interface IDanhMucService
{
    Task<List<DanhMucDto>> GetAllAsync();
    Task<DanhMucDto> CreateAsync(CreateDanhMucDto dto);
    Task<DanhMucDto?> UpdateAsync(int id, UpdateDanhMucDto dto);
    Task<bool> DeleteAsync(int id);
}