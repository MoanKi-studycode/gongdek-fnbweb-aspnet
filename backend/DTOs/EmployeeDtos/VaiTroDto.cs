namespace GongDek_Nhom20.DTOs.EmployeeDtos;

/// <summary>Vai trò nhân viên — dùng cho dropdown form.</summary>
public class VaiTroDto
{
    public int MaVaiTro { get; set; }
    public string TenVaiTro { get; set; } = null!;
    public string? MoTa { get; set; }
}
