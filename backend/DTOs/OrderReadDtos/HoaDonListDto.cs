namespace GongDek_Nhom20.DTOs.OrderReadDtos;

public class HoaDonListDto
{
    public int MaHoaDon { get; set; }
    public string LoaiDon { get; set; } = null!;
    public string TrangThaiHoaDon { get; set; } = null!;
    public string? TenKhachHang { get; set; }
    public string? SoDienThoaiKhach { get; set; }
    public string TenNhanVienLap { get; set; } = null!;
    public DateTime ThoiGianLap { get; set; }
    public decimal TongThanhToan { get; set; }
    public string? PhuongThucThanhToan { get; set; }
}
