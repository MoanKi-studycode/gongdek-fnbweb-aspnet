using GongDek_Nhom20.DTOs.EmployeeDtos;

namespace GongDek_Nhom20.Services;

/// <summary>Nghiệp vụ quản lý nhân viên — phụ trách: Trần Anh Tín.</summary>
public interface INhanVienService
{
    Task<List<NhanVienDto>> GetAllAsync(string? search, int? maVaiTro);
    Task<NhanVienDto> GetByIdAsync(int id);
    Task<List<VaiTroDto>> GetVaiTroNhanVienAsync();
    Task<NhanVienDto> CreateAsync(CreateNhanVienDto dto);
    Task<NhanVienDto> UpdateAsync(int id, UpdateNhanVienDto dto);
    Task<NhanVienDto> LockAsync(int id);
    Task<NhanVienDto> UnlockAsync(int id);
}
