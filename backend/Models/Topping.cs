namespace GongDek_Nhom20.Models;

public class Topping
{
    public int MaTopping { get; set; }
    public string TenTopping { get; set; } = null!;
    public decimal DonGia { get; set; }
    public string TrangThai { get; set; } = "DangBan";

    public ICollection<ChiTietHoaDonTopping> ChiTietHoaDonToppings { get; set; } = new List<ChiTietHoaDonTopping>();
}
