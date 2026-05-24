namespace GongDek_Nhom20.DTOs.DashboardDtos;

/// <summary>Top sản phẩm bán chạy.</summary>
public class TopSanPhamDto
{
    public string TenSanPham { get; set; } = null!;
    public int SoLuong { get; set; }
}

/// <summary>Doanh thu theo ngày — biểu đồ.</summary>
public class DoanhThuNgayDto
{
    public string Nhan { get; set; } = null!;
    public DateOnly Ngay { get; set; }
    public decimal DoanhThu { get; set; }
}

/// <summary>Đơn online chờ xác nhận.</summary>
public class DonOnlineChoDto
{
    public int MaHoaDon { get; set; }
    public string HoTen { get; set; } = null!;
    public decimal TongThanhToan { get; set; }
    public DateTime ThoiGianLap { get; set; }
}

/// <summary>Nguyên liệu sắp hết / dưới ngưỡng.</summary>
public class NguyenLieuCanhBaoDto
{
    public int MaNL { get; set; }
    public string TenNguyenLieu { get; set; } = null!;
    public decimal SoLuongTon { get; set; }
    public string DonViTinh { get; set; } = null!;
    public decimal NguongCanhBao { get; set; }
    public string TrangThai { get; set; } = null!;
}

/// <summary>Tổng quan dashboard quản trị.</summary>
public class DashboardTongQuanDto
{
    public decimal DoanhThuHomNay { get; set; }
    public decimal DoanhThuThang { get; set; }
    public int SoHoaDonHomNay { get; set; }
    public int SoDonTaiQuay { get; set; }
    public int SoDonOnline { get; set; }
    public int SoKhachHomNay { get; set; }
    public int KhachMoiHomNay { get; set; }
    public int DonOnlineChoXacNhan { get; set; }
    public List<TopSanPhamDto> TopSanPham { get; set; } = new();
    public List<DoanhThuNgayDto> DoanhThu7Ngay { get; set; } = new();
    public List<DonOnlineChoDto> DonOnlineCho { get; set; } = new();
    public List<NguyenLieuCanhBaoDto> NguyenLieuSapHet { get; set; } = new();
}

/// <summary>Thống kê doanh thu theo khoảng thời gian.</summary>
public class DoanhThuThongKeDto
{
    public decimal TongDoanhThu { get; set; }
    public int SoHoaDon { get; set; }
    public DateOnly TuNgay { get; set; }
    public DateOnly DenNgay { get; set; }
}

/// <summary>Thống kê đơn hàng hôm nay.</summary>
public class DonHomNayDto
{
    public int TongDon { get; set; }
    public int DonTaiQuay { get; set; }
    public int DonOnline { get; set; }
    public decimal TongDoanhThu { get; set; }
}
