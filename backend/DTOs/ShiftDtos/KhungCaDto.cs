namespace GongDek_Nhom20.DTOs.ShiftDtos;

/// <summary>Thông tin khung ca làm việc.</summary>
public class KhungCaDto
{
    public int MaKhungCa { get; set; }
    public string TenCa { get; set; } = null!;
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public string TrangThai { get; set; } = null!;
}
