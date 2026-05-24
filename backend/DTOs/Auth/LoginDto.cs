using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.Auth;

/// <summary>Dữ liệu đăng nhập — nhân viên dùng TenDangNhap, khách hàng dùng Email.</summary>
public class LoginDto
{
    [MaxLength(50)]
    public string? TenDangNhap { get; set; }

    [MaxLength(100)]
    [EmailAddress]
    public string? Email { get; set; }

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    [MinLength(8, ErrorMessage = "Mật khẩu tối thiểu 8 ký tự")]
    public string MatKhau { get; set; } = null!;
}
