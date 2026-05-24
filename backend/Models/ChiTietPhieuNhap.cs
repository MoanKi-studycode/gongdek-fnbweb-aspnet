namespace GongDek_Nhom20.Models;

public class ChiTietPhieuNhap
{
    public int MaChiTietNhap { get; set; }
    public int MaPhieuNhap { get; set; }
    public int MaNL { get; set; }
    public decimal SoLuongNhap { get; set; }
    public decimal DonGiaNhap { get; set; }
    public DateOnly? HanSuDung { get; set; }
    public decimal ThanhTien { get; set; }

    public PhieuNhapKho PhieuNhapKho { get; set; } = null!;
    public NguyenLieu NguyenLieu { get; set; } = null!;
}
