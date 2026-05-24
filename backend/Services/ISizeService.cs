using GongDek_Nhom20.DTOs.CatalogDtos;

namespace GongDek_Nhom20.Services;

public interface ISizeService
{
    Task<List<SizeDto>> GetAllAsync();
}
