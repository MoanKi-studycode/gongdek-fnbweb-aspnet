namespace GongDek_Nhom20.Models;

public class Voucher
{
    public int MaVoucher { get; set; }
    public string MaCode { get; set; } = null!;
    public string? MoTa { get; set; }
    public decimal GiaTriGiam { get; set; }
    public decimal? DonHangToiThieu { get; set; }
    public DateOnly NgayBatDau { get; set; }
    public DateOnly NgayKetThuc { get; set; }
    public string TrangThai { get; set; } = "ConHieuLuc";

    public ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();
}
