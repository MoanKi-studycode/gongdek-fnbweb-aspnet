namespace GongDek_Nhom20.DTOs.DanhGiaDtos;

public class DanhGiaDto
{
    public int MaDanhGia { get; set; }
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string NguoiDung { get; set; } = null!;
    public byte SoSao { get; set; }
    public string? BinhLuan { get; set; }
    public DateTime NgayDanhGia { get; set; }
}

public class CreateDanhGiaDto
{
    public int MaHoaDon { get; set; }
    public int MaSanPham { get; set; }
    public byte SoSao { get; set; }
    public string? NoiDung { get; set; }
}
