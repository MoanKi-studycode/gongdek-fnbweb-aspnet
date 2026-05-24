namespace GongDek_Nhom20.DTOs.ShiftDtos;

/// <summary>Thông tin ca làm việc trả về API.</summary>
public class CaLamViecDto
{
    public int MaCa { get; set; }
    public int MaKhungCa { get; set; }
    public string TenCa { get; set; } = null!;
    public int MaNV { get; set; }
    public string HoTenNV { get; set; } = null!;
    public DateOnly NgayLam { get; set; }
    public DateTime ThoiGianMo { get; set; }
    public DateTime? ThoiGianDong { get; set; }
    public decimal TienQuyDauCa { get; set; }
    public decimal? TienMatThucTe { get; set; }
    public string TrangThaiCa { get; set; } = null!;
    public string? GhiChu { get; set; }
}
