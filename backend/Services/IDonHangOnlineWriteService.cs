using System.Security.Claims;
using System.Threading.Tasks;
using GongDek_Nhom20.DTOs.OrderWrite;

namespace GongDek_Nhom20.Services;

public interface IDonHangOnlineWriteService
{
    
    Task<CreateDonHangOnlineResultDto> CreateAsync(ClaimsPrincipal principal, CreateDonHangOnlineDto dto);

    // HÀM BỔ SUNG 
    Task<bool> UpdateStatusAsync(int id, string trangThaiMoi, string? lyDoHuy = null);
}