using GongDek_Nhom20.DTOs.InventoryDtos;

namespace GongDek_Nhom20.Services;

public interface INhaCungCapService
{
    Task<List<NhaCungCapDto>> GetAllAsync(string? search = null);
    Task<NhaCungCapDto?> GetByIdAsync(int id);
    Task<NhaCungCapDto> CreateAsync(CreateNhaCungCapDto dto);
    Task<NhaCungCapDto?> UpdateAsync(int id, UpdateNhaCungCapDto dto);
    Task<bool> DeleteAsync(int id);
}
