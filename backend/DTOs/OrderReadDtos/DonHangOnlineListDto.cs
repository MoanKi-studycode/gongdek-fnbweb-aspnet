namespace GongDek_Nhom20.DTOs.OrderReadDtos;

public class DonHangOnlineListDto
{
    public int MaHoaDon { get; set; }
    public string HoTenNhanHang { get; set; } = null!;
    public string SoDienThoaiNhan { get; set; } = null!;
    public string DiaChiGiao { get; set; } = null!;
    public string TrangThaiOnline { get; set; } = null!;
    public decimal TongThanhToan { get; set; }
    public DateTime ThoiGianLap { get; set; }
    public DateTime? ThoiGianXacNhan { get; set; }
    public DateTime? ThoiGianHoanThanh { get; set; }
}
