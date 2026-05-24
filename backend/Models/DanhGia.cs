namespace GongDek_Nhom20.Models;

public class DanhGia
{
    public int MaDanhGia { get; set; }
    public int MaHoaDon { get; set; }
    public int MaSanPham { get; set; }
    public int? MaKH { get; set; }
    public byte SoSao { get; set; }
    public string? NoiDung { get; set; }
    public DateTime NgayDanhGia { get; set; }

    public HoaDon HoaDon { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
    public KhachHang? KhachHang { get; set; }
}
