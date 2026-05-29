namespace GongDek_Nhom20.DTOs.OrderWrite;

public class PosCheckoutDto
{
    public string? SoDienThoaiKhachHang { get; set; }
    public string? MaVoucher { get; set; }
    public string PhuongThucThanhToan { get; set; } = "TienMat";
    public decimal? TienKhachDua { get; set; }
    public string? GhiChu { get; set; }
    public List<CreateDonHangOnlineChiTietDto> ChiTiet { get; set; } = new();
}

public class UpdateOrderStatusDto
{
    public string TrangThai { get; set; } = null!;
    public string? LyDoHuy { get; set; }
}

public class CancelOrderDto
{
    public string LyDoHuy { get; set; } = null!;
    public decimal? SoTienHoan { get; set; }
    public string? HinhThucHoan { get; set; }
}
