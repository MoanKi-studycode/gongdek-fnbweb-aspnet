using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.ShiftDtos;

/// <summary>Dữ liệu mở ca làm việc mới.</summary>
public class MoCaDto
{
    [Required(ErrorMessage = "Khung ca không được để trống.")]
    public int MaKhungCa { get; set; }

    [Required(ErrorMessage = "Nhân viên không được để trống.")]
    public int MaNV { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Tiền quỹ đầu ca phải >= 0.")]
    public decimal TienQuyDauCa { get; set; }

    public DateOnly? NgayLam { get; set; }

    [MaxLength(255)]
    public string? GhiChu { get; set; }
}
