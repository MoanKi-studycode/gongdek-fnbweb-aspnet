using GongDek_Nhom20.DTOs.Auth;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API xác thực và phân quyền — phụ trách: Trần Anh Tín.</summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    #region Xử lý đăng nhập hệ thống

    /// <summary>POST /api/auth/login — đăng nhập nhân viên hoặc khách hàng.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    /// <summary>POST /api/auth/register-customer — đăng ký tài khoản khách hàng.</summary>
    [HttpPost("register-customer")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> RegisterCustomer([FromBody] RegisterCustomerDto dto)
    {
        var result = await _authService.RegisterCustomerAsync(dto);
        return Ok(result);
    }

    /// <summary>GET /api/auth/me — lấy thông tin người dùng đang đăng nhập.</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> Me()
    {
        var user = await _authService.GetCurrentUserAsync(User);
        if (user == null)
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });

        return Ok(user);
    }

    /// <summary>POST /api/auth/logout — client xóa token; API xác nhận đăng xuất.</summary>
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // JWT stateless — client xóa token ở localStorage
        return Ok(new { message = "Đăng xuất thành công." });
    }

    #endregion
}
