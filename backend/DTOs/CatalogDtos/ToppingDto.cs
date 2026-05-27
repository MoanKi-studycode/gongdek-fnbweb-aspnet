namespace GongDek_Nhom20.DTOs.CatalogDtos;

public class ToppingDto
{
    public int MaTopping { get; set; }
    public string TenTopping { get; set; } = null!;
    public decimal DonGia { get; set; }
    public string TrangThai { get; set; } = null!;
}

public class CreateToppingDto
{
    public string TenTopping { get; set; } = null!;
    public decimal DonGia { get; set; }
    public string TrangThai { get; set; } = "DangBan";
}

public class UpdateToppingDto
{
    public string TenTopping { get; set; } = null!;
    public decimal DonGia { get; set; }
    public string TrangThai { get; set; } = "DangBan";
}
