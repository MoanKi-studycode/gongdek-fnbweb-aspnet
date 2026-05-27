namespace GongDek_Nhom20.DTOs.CatalogDtos;

public class SizeDto
{
    public int MaSize { get; set; }
    public string TenSize { get; set; } = null!;
    public decimal PhuThu { get; set; }
    public string TrangThai { get; set; } = null!;
}

public class CreateSizeDto
{
    public string TenSize { get; set; } = null!;
    public decimal PhuThu { get; set; }
    public string TrangThai { get; set; } = "DangApDung";
}

public class UpdateSizeDto
{
    public string TenSize { get; set; } = null!;
    public decimal PhuThu { get; set; }
    public string TrangThai { get; set; } = "DangApDung";
}
