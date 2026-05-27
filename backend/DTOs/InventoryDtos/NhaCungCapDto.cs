namespace GongDek_Nhom20.DTOs.InventoryDtos;

public class NhaCungCapDto
{
    public int MaNCC { get; set; }
    public string TenNCC { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }
    public string? Email { get; set; }
    public string? NguoiLienHe { get; set; }
    public string TrangThai { get; set; } = "DangHopTac";
    public int SoPhieuNhap { get; set; }
}

public class CreateNhaCungCapDto
{
    public string TenNCC { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }
    public string? Email { get; set; }
    public string? NguoiLienHe { get; set; }
    public string TrangThai { get; set; } = "DangHopTac";
}

public class UpdateNhaCungCapDto : CreateNhaCungCapDto
{
}
