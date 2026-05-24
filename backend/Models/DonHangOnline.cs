namespace GongDek_Nhom20.Models;

public class DonHangOnline
{
    public int MaHoaDon { get; set; }
    public string HoTenNhanHang { get; set; } = null!;
    public string SoDienThoaiNhan { get; set; } = null!;
    public string DiaChiGiao { get; set; } = null!;
    public string? GhiChuGiaoHang { get; set; }
    public string TrangThaiOnline { get; set; } = "ChoXacNhan";
    public int? MaNVXacNhan { get; set; }
    public DateTime? ThoiGianXacNhan { get; set; }
    public DateTime? ThoiGianHoanThanh { get; set; }
    public string? LyDoHuy { get; set; }

    public HoaDon HoaDon { get; set; } = null!;
    public NhanVien? NhanVienXacNhan { get; set; }
}
