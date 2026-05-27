using GongDek_Nhom20.DTOs.CatalogDtos;

namespace GongDek_Nhom20.Services;

public interface ISizeService
{
    Task<List<SizeDto>> GetAllAsync();
    Task<SizeDto> CreateAsync(CreateSizeDto dto);
    Task<SizeDto?> UpdateAsync(int id, UpdateSizeDto dto);
    Task<bool> DeleteAsync(int id);
}
