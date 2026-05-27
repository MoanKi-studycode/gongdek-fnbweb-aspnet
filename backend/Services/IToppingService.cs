using GongDek_Nhom20.DTOs.CatalogDtos;

namespace GongDek_Nhom20.Services;

public interface IToppingService
{
    Task<List<ToppingDto>> GetAllAsync();
    Task<ToppingDto> CreateAsync(CreateToppingDto dto);
    Task<ToppingDto?> UpdateAsync(int id, UpdateToppingDto dto);
    Task<bool> DeleteAsync(int id);
}
