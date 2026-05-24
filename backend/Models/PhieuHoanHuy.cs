namespace GongDek_Nhom20.Models;

public class PhieuHoanHuy
{
    public int MaPhieu { get; set; }
    public int MaHoaDon { get; set; }
    public int MaNVXuLy { get; set; }
    public string HinhThucXuLy { get; set; } = null!;
    public string LyDo { get; set; } = null!;
    public decimal? SoTienHoan { get; set; }
    public string? HinhThucHoan { get; set; }
    public string TrangThaiXuLy { get; set; } = "DaGhiNhan";
    public DateTime ThoiGianLap { get; set; }

    public HoaDon HoaDon { get; set; } = null!;
    public NhanVien NhanVienXuLy { get; set; } = null!;
}
