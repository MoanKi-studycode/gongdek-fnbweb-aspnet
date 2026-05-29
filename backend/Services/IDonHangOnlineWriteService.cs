using System.Security.Claims;
using GongDek_Nhom20.DTOs.OrderWrite;

namespace GongDek_Nhom20.Services;

public interface IDonHangOnlineWriteService
{
    Task<CreateDonHangOnlineResultDto> CreateAsync(ClaimsPrincipal principal, CreateDonHangOnlineDto dto);
    Task<CreateDonHangOnlineResultDto> PosCheckoutAsync(ClaimsPrincipal principal, PosCheckoutDto dto);
    Task<bool> UpdateStatusAsync(ClaimsPrincipal principal, int maHoaDon, string trangThaiMoi, string? lyDoHuy = null);
    Task<bool> CancelAsync(ClaimsPrincipal principal, int maHoaDon, CancelOrderDto dto);
}
