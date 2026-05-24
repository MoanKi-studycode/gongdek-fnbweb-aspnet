using GongDek_Nhom20.DTOs.OrderReadDtos;

namespace GongDek_Nhom20.Services;

public interface IHoaDonReadService
{
    Task<List<HoaDonListDto>> GetAllAsync(string? trangThai, DateOnly? tuNgay, DateOnly? denNgay);
    Task<HoaDonDetailDto> GetByIdAsync(int id);
}
