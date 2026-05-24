using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.EmployeeDtos;

/// <summary>Dữ liệu tạo nhân viên mới.</summary>
public class CreateNhanVienDto
{
    [Required(ErrorMessage = "Họ tên không được để trống.")]
    [MaxLength(100)]
    public string HoTen { get; set; } = null!;

    [MaxLength(15)]
    public string? SoDienThoai { get; set; }

    public DateOnly? NgaySinh { get; set; }

    [MaxLength(10)]
    public string? GioiTinh { get; set; }

    [MaxLength(255)]
    public string? DiaChi { get; set; }

    [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
    [MaxLength(50)]
    public string TenDangNhap { get; set; } = null!;

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [MinLength(8)]
    public string MatKhau { get; set; } = null!;

    [Required(ErrorMessage = "Vai trò không được để trống.")]
    public int MaVaiTro { get; set; }
}
