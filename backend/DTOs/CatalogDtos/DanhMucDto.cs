using System.ComponentModel.DataAnnotations;

namespace GongDek_Nhom20.DTOs.CatalogDtos;

public class DanhMucDto
{
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = null!;
    public string? MoTa { get; set; }
    public int ThuTuHienThi { get; set; }
    public string TrangThai { get; set; } = null!;
    public int SoLuongSanPham { get; set; }
}

public class CreateDanhMucDto
{
    [Required(ErrorMessage = "Tên danh mục không được để trống")]
    [MaxLength(100, ErrorMessage = "Tên danh mục tối đa 100 ký tự")]
    public string TenDanhMuc { get; set; } = null!;

    [MaxLength(255, ErrorMessage = "Mô tả tối đa 255 ký tự")]
    public string? MoTa { get; set; }

    public int ThuTuHienThi { get; set; }

    [RegularExpression("^(HienThi|An)$", ErrorMessage = "Trạng thái chỉ được là HienThi hoặc An")]
    public string TrangThai { get; set; } = "HienThi";
}

public class UpdateDanhMucDto
{
    [Required(ErrorMessage = "Tên danh mục không được để trống")]
    [MaxLength(100, ErrorMessage = "Tên danh mục tối đa 100 ký tự")]
    public string TenDanhMuc { get; set; } = null!;

    [MaxLength(255, ErrorMessage = "Mô tả tối đa 255 ký tự")]
    public string? MoTa { get; set; }

    public int ThuTuHienThi { get; set; }

    [RegularExpression("^(HienThi|An)$", ErrorMessage = "Trạng thái chỉ được là HienThi hoặc An")]
    public string TrangThai { get; set; } = "HienThi";
}
