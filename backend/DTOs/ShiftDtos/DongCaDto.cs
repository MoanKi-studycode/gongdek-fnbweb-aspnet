using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.ShiftDtos;

/// <summary>Dữ liệu đóng ca làm việc.</summary>
public class DongCaDto
{
    [Required(ErrorMessage = "Tiền mặt thực tế không được để trống.")]
    [Range(0, double.MaxValue, ErrorMessage = "Tiền mặt thực tế phải >= 0.")]
    public decimal TienMatThucTe { get; set; }

    [MaxLength(255)]
    public string? GhiChu { get; set; }
}
