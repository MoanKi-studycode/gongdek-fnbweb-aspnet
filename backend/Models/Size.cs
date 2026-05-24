using System.ComponentModel.DataAnnotations.Schema;

namespace GongDek_Nhom20.Models;

[Table("Size")]
public class Size
{
    public int MaSize { get; set; }
    public string TenSize { get; set; } = null!;
    public decimal PhuThu { get; set; }
    public string TrangThai { get; set; } = "DangApDung";

    public ICollection<ChiTietHoaDon> ChiTietHoaDons { get; set; } = new List<ChiTietHoaDon>();
}
