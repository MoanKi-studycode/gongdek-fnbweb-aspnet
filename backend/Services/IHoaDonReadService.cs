using GongDek_Nhom20.DTOs.OrderReadDtos;

namespace GongDek_Nhom20.Services;

public interface IHoaDonReadService
{
    Task<List<HoaDonListDto>> GetAllAsync(string? trangThai, DateOnly? tuNgay, DateOnly? denNgay);
    Task<List<HoaDonListDto>> GetByKhachHangAsync(int maKh, int? limit = null);
    Task<HoaDonDetailDto> GetByIdAsync(int id);
    Task<HoaDonDetailDto> GetByIdForKhachHangAsync(int maKh, int id);
}
