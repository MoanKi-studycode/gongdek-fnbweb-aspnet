namespace GongDek_Nhom20.DTOs.EmployeeDtos;

/// <summary>Thông tin nhân viên trả về API — không bao gồm mật khẩu.</summary>
public class NhanVienDto
{
    public int MaNV { get; set; }
    public string HoTen { get; set; } = null!;
    public string? SoDienThoai { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? DiaChi { get; set; }
    public string TenDangNhap { get; set; } = null!;
    public int MaVaiTro { get; set; }
    public string TenVaiTro { get; set; } = null!;
    public string TrangThai { get; set; } = null!;
    public DateTime NgayTao { get; set; }
}
