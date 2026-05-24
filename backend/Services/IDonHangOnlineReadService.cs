using GongDek_Nhom20.DTOs.OrderReadDtos;

namespace GongDek_Nhom20.Services;

public interface IDonHangOnlineReadService
{
    Task<List<DonHangOnlineListDto>> GetAllAsync(string? trangThai);
    Task<DonHangOnlineDetailDto> GetByIdAsync(int id);
}
