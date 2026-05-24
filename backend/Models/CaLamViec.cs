namespace GongDek_Nhom20.Models;

public class CaLamViec
{
    public int MaCa { get; set; }
    public int MaKhungCa { get; set; }
    public int MaNV { get; set; }
    public DateOnly NgayLam { get; set; }
    public DateTime ThoiGianMo { get; set; }
    public DateTime? ThoiGianDong { get; set; }
    public decimal TienQuyDauCa { get; set; }
    public decimal? TienMatThucTe { get; set; }
    public string TrangThaiCa { get; set; } = "DangMo";
    public string? GhiChu { get; set; }

    public KhungCa KhungCa { get; set; } = null!;
    public NhanVien NhanVien { get; set; } = null!;
    public ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();
}
