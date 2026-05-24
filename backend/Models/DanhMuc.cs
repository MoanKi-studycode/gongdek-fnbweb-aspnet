namespace GongDek_Nhom20.Models;

public class DanhMuc
{
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = null!;
    public string? MoTa { get; set; }
    public int ThuTuHienThi { get; set; }
    public string TrangThai { get; set; } = "HienThi";

    public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
