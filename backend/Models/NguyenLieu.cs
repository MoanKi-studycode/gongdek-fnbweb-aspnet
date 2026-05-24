namespace GongDek_Nhom20.Models;

public class NguyenLieu
{
    public int MaNL { get; set; }
    public string TenNL { get; set; } = null!;
    public string DonViTinh { get; set; } = null!;
    public decimal SoLuongTon { get; set; }
    public decimal SoLuongCanhBao { get; set; }
    public DateOnly? HanSuDungGanNhat { get; set; }
    public string TrangThai { get; set; } = "ConHang";

    public ICollection<ChiTietPhieuNhap> ChiTietPhieuNhaps { get; set; } = new List<ChiTietPhieuNhap>();
}
