namespace GongDek_Nhom20.DTOs.Auth;

/// <summary>Phản hồi sau khi đăng nhập thành công.</summary>
public class LoginResponseDto
{
    public string Token { get; set; } = null!;
    public UserProfileDto User { get; set; } = null!;
}

/// <summary>Thông tin người dùng hiện tại.</summary>
public class UserProfileDto
{
    public int Id { get; set; }
    public string HoTen { get; set; } = null!;
    public string VaiTro { get; set; } = null!;
    public string? TenDangNhap { get; set; }
    public string? Email { get; set; }
}
