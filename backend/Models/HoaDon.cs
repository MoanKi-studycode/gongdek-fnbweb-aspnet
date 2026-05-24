namespace GongDek_Nhom20.Models;

public class HoaDon
{
    public int MaHoaDon { get; set; }
    public string LoaiDon { get; set; } = null!;
    public string TrangThaiHoaDon { get; set; } = "ChoThanhToan";
    public int? MaKH { get; set; }
    public int MaNVLap { get; set; }
    public int? MaCa { get; set; }
    public decimal TongTienMon { get; set; }
    public decimal PhiGiaoHang { get; set; }
    public decimal TienGiamGia { get; set; }
    public int DiemSuDung { get; set; }
    public decimal TongThanhToan { get; set; }
    public string? PhuongThucThanhToan { get; set; }
    public decimal? TienKhachDua { get; set; }
    public decimal? TienThua { get; set; }
    public int? MaVoucher { get; set; }
    public DateTime ThoiGianLap { get; set; }
    public DateTime? ThoiGianThanhToan { get; set; }
    public string? GhiChu { get; set; }

    public KhachHang? KhachHang { get; set; }
    public NhanVien NhanVienLap { get; set; } = null!;
    public CaLamViec? CaLamViec { get; set; }
    public Voucher? Voucher { get; set; }
    public DonHangOnline? DonHangOnline { get; set; }
    public ICollection<ChiTietHoaDon> ChiTietHoaDons { get; set; } = new List<ChiTietHoaDon>();
    public ICollection<PhieuHoanHuy> PhieuHoanHuys { get; set; } = new List<PhieuHoanHuy>();
    public ICollection<DanhGia> DanhGias { get; set; } = new List<DanhGia>();
}
