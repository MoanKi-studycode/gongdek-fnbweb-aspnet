using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.EmployeeDtos;

/// <summary>Dữ liệu cập nhật nhân viên — không đổi tên đăng nhập.</summary>
public class UpdateNhanVienDto
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

    [Required(ErrorMessage = "Vai trò không được để trống.")]
    public int MaVaiTro { get; set; }

    /// <summary>Mật khẩu mới — để trống nếu không đổi.</summary>
    [MinLength(8)]
    public string? MatKhau { get; set; }
}
