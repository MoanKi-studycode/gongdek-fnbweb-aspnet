namespace GongDek_Nhom20.DTOs.OrderReadDtos;

public class HoaDonDetailDto
{
    public int MaHoaDon { get; set; }
    public string LoaiDon { get; set; } = null!;
    public string TrangThaiHoaDon { get; set; } = null!;
    public string? TenKhachHang { get; set; }
    public string? SoDienThoaiKhach { get; set; }
    public string TenNhanVienLap { get; set; } = null!;
    public DateTime ThoiGianLap { get; set; }
    public decimal TongTienMon { get; set; }
    public decimal TienGiamGia { get; set; }
    public decimal PhiGiaoHang { get; set; }
    public decimal TongThanhToan { get; set; }
    public string? PhuongThucThanhToan { get; set; }
    public string? GhiChu { get; set; }
    public List<ChiTietHoaDonDto> ChiTiet { get; set; } = [];
}

public class ChiTietHoaDonDto
{
    public int MaChiTiet { get; set; }
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public int MaSize { get; set; }
    public string TenSize { get; set; } = null!;
    public int SoLuong { get; set; }
    public decimal DonGiaGoc { get; set; }
    public decimal PhuThuSize { get; set; }
    public decimal ThanhTien { get; set; }
    public string? GhiChu { get; set; }
    public List<ChiTietToppingDto> Toppings { get; set; } = [];
}

public class ChiTietToppingDto
{
    public int MaTopping { get; set; }
    public string TenTopping { get; set; } = null!;
    public decimal DonGiaTopping { get; set; }
    public int SoLuong { get; set; }
}
