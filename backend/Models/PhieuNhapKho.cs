namespace GongDek_Nhom20.Models;

public class PhieuNhapKho
{
    public int MaPhieuNhap { get; set; }
    public int MaNCC { get; set; }
    public int MaNVLap { get; set; }
    public int? MaNVDuyet { get; set; }
    public DateOnly NgayNhap { get; set; }
    public DateTime? NgayDuyet { get; set; }
    public string TrangThaiPhieu { get; set; } = "ChoDuyet";
    public decimal TongTienNhap { get; set; }
    public string? GhiChu { get; set; }

    public NhaCungCap NhaCungCap { get; set; } = null!;
    public NhanVien NhanVienLap { get; set; } = null!;
    public NhanVien? NhanVienDuyet { get; set; }
    public ICollection<ChiTietPhieuNhap> ChiTietPhieuNhaps { get; set; } = new List<ChiTietPhieuNhap>();
}
