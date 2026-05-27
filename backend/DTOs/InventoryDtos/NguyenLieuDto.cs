namespace GongDek_Nhom20.DTOs.InventoryDtos;

public class NguyenLieuDto
{
    public int MaNL { get; set; }
    public string TenNL { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public decimal SoLuongTon { get; set; }
    public decimal SoLuongCanhBao { get; set; }
    public DateOnly? HanSuDungGanNhat { get; set; }
    public string TrangThai { get; set; } = "ConHang";
    public bool CanhBaoTonKho { get; set; }
    public int SoLanNhap { get; set; }
}

public class CreateNguyenLieuDto
{
    public string TenNL { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public decimal SoLuongTon { get; set; }
    public decimal SoLuongCanhBao { get; set; }
    public DateOnly? HanSuDungGanNhat { get; set; }
    public string TrangThai { get; set; } = "ConHang";
}

public class UpdateNguyenLieuDto : CreateNguyenLieuDto
{
}

public class DieuChinhTonKhoDto
{
    public decimal SoLuong { get; set; }
    public string LoaiDieuChinh { get; set; } = "Nhap"; // Nhap hoặc Xuat
}
