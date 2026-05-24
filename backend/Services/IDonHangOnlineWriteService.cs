using System.Security.Claims;
using GongDek_Nhom20.DTOs.OrderWrite;

namespace GongDek_Nhom20.Services;

public interface IDonHangOnlineWriteService
{
    Task<CreateDonHangOnlineResultDto> CreateAsync(ClaimsPrincipal principal, CreateDonHangOnlineDto dto);
}
