namespace GongDek_Nhom20.DTOs.CatalogDtos;

public class SanPhamDto
{
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = null!;
    public string? MoTa { get; set; }
    public decimal GiaBanGoc { get; set; }
    public string? HinhAnh { get; set; }
    public string? GhiChuPhaChe { get; set; }
    public string TrangThai { get; set; } = null!;
}

public class CreateSanPhamDto
{
    public int MaDanhMuc { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? HinhAnh { get; set; }
    public decimal GiaBanGoc { get; set; }
    public string? GhiChuPhaChe { get; set; }
    public string TrangThai { get; set; } = "DangBan";
}

public class UpdateSanPhamDto
{
    public int MaDanhMuc { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? HinhAnh { get; set; }
    public decimal GiaBanGoc { get; set; }
    public string? GhiChuPhaChe { get; set; }
    public string TrangThai { get; set; } = "DangBan";
}
