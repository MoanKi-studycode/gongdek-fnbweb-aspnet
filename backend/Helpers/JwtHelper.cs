using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GongDek_Nhom20.DTOs.Auth;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GongDek_Nhom20.Helpers;

/// <summary>Tạo và đọc JWT access token.</summary>
public class JwtHelper
{
    private readonly JwtSettings _settings;

    public JwtHelper(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    #region Tạo token đăng nhập

    /// <summary>Tạo JWT kèm role claim cho phân quyền.</summary>
    public string GenerateToken(UserProfileDto user, string userType)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.Name, user.HoTen),
            new(ClaimTypes.Role, user.VaiTro),
            new("user_type", userType),
        };

        if (!string.IsNullOrEmpty(user.TenDangNhap))
            claims.Add(new Claim("ten_dang_nhap", user.TenDangNhap));

        if (!string.IsNullOrEmpty(user.Email))
            claims.Add(new Claim(ClaimTypes.Email, user.Email));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.ExpiresInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    #endregion

    #region Đọc thông tin từ token

    /// <summary>Lấy profile từ ClaimsPrincipal của request hiện tại.</summary>
    public static UserProfileDto? GetUserFromClaims(ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated != true)
            return null;

        var idClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(idClaim, out var id))
            return null;

        return new UserProfileDto
        {
            Id = id,
            HoTen = principal.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
            VaiTro = principal.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty,
            TenDangNhap = principal.FindFirst("ten_dang_nhap")?.Value,
            Email = principal.FindFirst(ClaimTypes.Email)?.Value,
        };
    }

    #endregion
}
