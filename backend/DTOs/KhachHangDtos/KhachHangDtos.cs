namespace GongDek_Nhom20.DTOs.KhachHangDtos;

public class KhachHangDto
{
    public int MaKH { get; set; }
    public string HoTen { get; set; } = null!;
    public string SoDienThoai { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string HangThanhVien { get; set; } = null!;
    public int DiemTichLuy { get; set; }
    public string TrangThai { get; set; } = null!;
    public decimal TongChiTieu { get; set; }
}

public class CreateKhachHangDto
{
    public string HoTen { get; set; } = null!;
    public string SoDienThoai { get; set; } = null!;
    public string? Email { get; set; }
}

public class UpdateKhachHangDto
{
    public string? HoTen { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? HangThanhVien { get; set; }
    public int? DiemTichLuy { get; set; }
    public string? TrangThai { get; set; }
}
