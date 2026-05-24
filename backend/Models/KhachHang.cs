namespace GongDek_Nhom20.Models;

public class KhachHang
{
    public int MaKH { get; set; }
    public string HoTen { get; set; } = null!;
    public string SoDienThoai { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string MatKhauHash { get; set; } = null!;
    public DateOnly? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string HangThanhVien { get; set; } = "ThanhVien";
    public int DiemTichLuy { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime NgayDangKy { get; set; }

    public ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();
    public ICollection<DanhGia> DanhGias { get; set; } = new List<DanhGia>();
}
