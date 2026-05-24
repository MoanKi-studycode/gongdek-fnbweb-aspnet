namespace GongDek_Nhom20.Models;

public class NhaCungCap
{
    public int MaNCC { get; set; }
    public string TenNCC { get; set; } = null!;
    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }
    public string? Email { get; set; }
    public string? NguoiLienHe { get; set; }
    public string TrangThai { get; set; } = "DangHopTac";

    public ICollection<PhieuNhapKho> PhieuNhapKhos { get; set; } = new List<PhieuNhapKho>();
}
