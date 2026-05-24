namespace GongDek_Nhom20.Models;

public class SanPham
{
    public int MaSanPham { get; set; }
    public int MaDanhMuc { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? HinhAnh { get; set; }
    public decimal GiaBanGoc { get; set; }
    public string? GhiChuPhaChe { get; set; }
    public string TrangThai { get; set; } = "DangBan";

    public DanhMuc DanhMuc { get; set; } = null!;
    public ICollection<ChiTietHoaDon> ChiTietHoaDons { get; set; } = new List<ChiTietHoaDon>();
    public ICollection<DanhGia> DanhGias { get; set; } = new List<DanhGia>();
}
