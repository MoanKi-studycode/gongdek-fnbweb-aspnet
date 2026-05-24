using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.Auth;

/// <summary>Đăng ký tài khoản khách hàng mới.</summary>
public class RegisterCustomerDto
{
    [Required(ErrorMessage = "Họ tên không được để trống")]
    [MaxLength(100)]
    public string HoTen { get; set; } = null!;

    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Số điện thoại không được để trống")]
    [MaxLength(15)]
    public string SoDienThoai { get; set; } = null!;

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    [MinLength(8, ErrorMessage = "Mật khẩu tối thiểu 8 ký tự")]
    public string MatKhau { get; set; } = null!;
}
