using System.ComponentModel.DataAnnotations.Schema;

namespace GongDek_Nhom20.Models;

[Table("ChiTietHoaDon_Topping")]
public class ChiTietHoaDonTopping
{
    public int MaChiTiet { get; set; }
    public int MaTopping { get; set; }
    public decimal DonGiaTopping { get; set; }
    public int SoLuong { get; set; } = 1;

    public ChiTietHoaDon ChiTietHoaDon { get; set; } = null!;
    public Topping Topping { get; set; } = null!;
}
