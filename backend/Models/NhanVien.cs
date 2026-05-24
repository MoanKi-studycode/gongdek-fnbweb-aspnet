namespace GongDek_Nhom20.Models;

public class NhanVien
{
    public int MaNV { get; set; }
    public string HoTen { get; set; } = null!;
    public string? SoDienThoai { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? DiaChi { get; set; }
    public string TenDangNhap { get; set; } = null!;
    public string MatKhauHash { get; set; } = null!;
    public int MaVaiTro { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime NgayTao { get; set; }

    public VaiTro VaiTro { get; set; } = null!;
    public ICollection<CaLamViec> CaLamViocs { get; set; } = new List<CaLamViec>();
    public ICollection<HoaDon> HoaDonsLap { get; set; } = new List<HoaDon>();
    public ICollection<DonHangOnline> DonHangOnlineXacNhan { get; set; } = new List<DonHangOnline>();
    public ICollection<PhieuHoanHuy> PhieuHoanHuys { get; set; } = new List<PhieuHoanHuy>();
    public ICollection<PhieuNhapKho> PhieuNhapKhosLap { get; set; } = new List<PhieuNhapKho>();
    public ICollection<PhieuNhapKho> PhieuNhapKhosDuyet { get; set; } = new List<PhieuNhapKho>();
}
