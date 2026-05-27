using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.InventoryDtos;

public class ChiTietPhieuNhapDto
{
    public int MaChiTietNhap { get; set; }
    public int MaNL { get; set; }
    public string TenNL { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public decimal SoLuongNhap { get; set; }
    public decimal DonGiaNhap { get; set; }
    public DateOnly? HanSuDung { get; set; }
    public decimal ThanhTien { get; set; }
}

public class PhieuNhapKhoDto
{
    public int MaPhieuNhap { get; set; }
    public string MaPhieuNhapText => $"PN{MaPhieuNhap:000000}";
    public int MaNCC { get; set; }
    public string TenNCC { get; set; } = string.Empty;
    public int MaNVLap { get; set; }
    public string TenNVLap { get; set; } = string.Empty;
    public int? MaNVDuyet { get; set; }
    public string? TenNVDuyet { get; set; }
    public DateOnly NgayNhap { get; set; }
    public DateTime? NgayDuyet { get; set; }
    public string TrangThaiPhieu { get; set; } = "ChoDuyet";
    public decimal TongTienNhap { get; set; }
    public string? GhiChu { get; set; }
    public List<ChiTietPhieuNhapDto> ChiTiet { get; set; } = new();
}

public class CreateChiTietPhieuNhapDto
{
    [Required]
    public int MaNL { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Số lượng nhập phải lớn hơn 0.")]
    public decimal SoLuongNhap { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Đơn giá nhập không được âm.")]
    public decimal DonGiaNhap { get; set; }

    public DateOnly? HanSuDung { get; set; }
}

public class CreatePhieuNhapKhoDto
{
    [Required]
    public int MaNCC { get; set; }

    public DateOnly? NgayNhap { get; set; }

    [MaxLength(255)]
    public string? GhiChu { get; set; }

    [MinLength(1, ErrorMessage = "Phiếu nhập phải có ít nhất một nguyên liệu.")]
    public List<CreateChiTietPhieuNhapDto> ChiTiet { get; set; } = new();
}

public class UpdatePhieuNhapKhoDto : CreatePhieuNhapKhoDto
{
}

public class UpdateTrangThaiPhieuNhapDto
{
    [MaxLength(255)]
    public string? GhiChu { get; set; }
}
