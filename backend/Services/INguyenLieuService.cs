using GongDek_Nhom20.DTOs.InventoryDtos;

namespace GongDek_Nhom20.Services;

public interface INguyenLieuService
{
    Task<List<NguyenLieuDto>> GetAllAsync(string? search = null, string? trangThai = null, bool? canhBao = null);
    Task<List<NguyenLieuDto>> GetCanhBaoTonKhoAsync();
    Task<NguyenLieuDto?> GetByIdAsync(int id);
    Task<NguyenLieuDto> CreateAsync(CreateNguyenLieuDto dto);
    Task<NguyenLieuDto?> UpdateAsync(int id, UpdateNguyenLieuDto dto);
    Task<NguyenLieuDto?> DieuChinhTonKhoAsync(int id, DieuChinhTonKhoDto dto);
    Task<bool> DeleteAsync(int id);
}
