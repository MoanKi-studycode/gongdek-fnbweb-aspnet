namespace GongDek_Nhom20.Models;

public class ChiTietHoaDon
{
    public int MaChiTiet { get; set; }
    public int MaHoaDon { get; set; }
    public int MaSanPham { get; set; }
    public int MaSize { get; set; }
    public int SoLuong { get; set; }
    public decimal DonGiaGoc { get; set; }
    public decimal PhuThuSize { get; set; }
    public decimal ThanhTien { get; set; }
    public string? GhiChu { get; set; }

    public HoaDon HoaDon { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
    public Size Size { get; set; } = null!;
    public ICollection<ChiTietHoaDonTopping> ChiTietHoaDonToppings { get; set; } = new List<ChiTietHoaDonTopping>();
}
