namespace GongDek_Nhom20.DTOs.OrderReadDtos;

public class DonHangOnlineDetailDto
{
    public int MaHoaDon { get; set; }
    public string HoTenNhanHang { get; set; } = null!;
    public string SoDienThoaiNhan { get; set; } = null!;
    public string DiaChiGiao { get; set; } = null!;
    public string? GhiChuGiaoHang { get; set; }
    public string TrangThaiOnline { get; set; } = null!;
    public DateTime? ThoiGianXacNhan { get; set; }
    public DateTime? ThoiGianHoanThanh { get; set; }
    public string? LyDoHuy { get; set; }
    public HoaDonDetailDto HoaDon { get; set; } = null!;
}
