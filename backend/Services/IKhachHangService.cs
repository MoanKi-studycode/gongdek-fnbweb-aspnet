using GongDek_Nhom20.DTOs.KhachHangDtos;

namespace GongDek_Nhom20.Services;

public interface IKhachHangService
{
    Task<List<KhachHangDto>> GetAllAsync(string? search);
    Task<KhachHangDto?> GetByIdAsync(int id);
    Task<KhachHangDto?> GetByPhoneAsync(string phone);
    Task<KhachHangDto> CreateAsync(CreateKhachHangDto dto);
    Task<KhachHangDto> UpdateAsync(int id, UpdateKhachHangDto dto);
    Task DeleteAsync(int id);
}
