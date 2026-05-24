using GongDek_Nhom20.DTOs.Auth;

namespace GongDek_Nhom20.Services;

/// <summary>Dịch vụ xác thực và phân quyền hệ thống.</summary>
public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<LoginResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto);
    Task<UserProfileDto?> GetCurrentUserAsync(System.Security.Claims.ClaimsPrincipal principal);
}
