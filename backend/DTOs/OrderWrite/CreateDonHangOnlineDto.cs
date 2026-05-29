namespace GongDek_Nhom20.DTOs.OrderWrite;

public class CreateDonHangOnlineDto
{
    public string DiaChiGiao { get; set; } = null!;
    public string? GhiChuGiaoHang { get; set; }
    public string? MaVoucher { get; set; }
    public List<CreateDonHangOnlineChiTietDto> ChiTiet { get; set; } = new();
}

public class CreateDonHangOnlineChiTietDto
{
    public int MaSanPham { get; set; }
    public string TenSize { get; set; } = null!;
    public int SoLuong { get; set; }
    public string? GhiChu { get; set; }
    public List<int> MaToppings { get; set; } = new();
}

public class CreateDonHangOnlineResultDto
{
    public int MaHoaDon { get; set; }
    public string? TrangThaiOnline { get; set; }
    public string TrangThaiHoaDon { get; set; } = null!;
    public decimal TongThanhToan { get; set; }
}
