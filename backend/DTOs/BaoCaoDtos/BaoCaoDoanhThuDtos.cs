namespace GongDek_Nhom20.DTOs.BaoCaoDtos;

/// <summary>Chi tiết một dòng hóa đơn trong báo cáo doanh thu.</summary>
public class BaoCaoDoanhThuChiTietDto
{
    public int MaHoaDon { get; set; }
    public DateTime ThoiGianLap { get; set; }
    public string NhanVienLap { get; set; } = null!;
    public string LoaiDon { get; set; } = null!;
    public string? PhuongThucThanhToan { get; set; }
    public string TrangThaiHoaDon { get; set; } = null!;
    public decimal TongTienMon { get; set; }
    public decimal TienGiamGia { get; set; }
    public decimal PhiGiaoHang { get; set; }
    public decimal TongThanhToan { get; set; }
}

/// <summary>Tổng hợp báo cáo doanh thu theo khoảng thời gian.</summary>
public class BaoCaoDoanhThuTongHopDto
{
    public DateOnly TuNgay { get; set; }
    public DateOnly DenNgay { get; set; }
    public DateTime NgayXuat { get; set; } = DateTime.Now;
    public int TongSoHoaDon { get; set; }
    public decimal TongDoanhThu { get; set; }
    public decimal TongTienMat { get; set; }
    public decimal TongChuyenKhoan { get; set; }
    public decimal TongViDienTu { get; set; }
    public List<BaoCaoDoanhThuChiTietDto> ChiTiet { get; set; } = new();
}
