namespace GongDek_Nhom20.Models;

public class KhungCa
{
    public int MaKhungCa { get; set; }
    public string TenCa { get; set; } = null!;
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public string TrangThai { get; set; } = "HoatDong";

    public ICollection<CaLamViec> CaLamViocs { get; set; } = new List<CaLamViec>();
}
