using System.Collections.Generic;

namespace GongDek_Nhom20.DTOs.OrderWrite;

/// <summary>Dữ liệu đặt hàng online từ khách HOẶC đơn tạo tại quầy (POS) từ nhân viên.</summary>
public class CreateDonHangOnlineDto
{
    // --- Các trường dành cho đơn Online ---
    public string? DiaChiGiao { get; set; }
    public string? GhiChuGiaoHang { get; set; }

    // --- CÁC TRƯỜNG BỔ SUNG 
    public string? LoaiDonHang { get; set; } // "Online" hoặc "TaiQuay"
    public string? SoDienThoaiKhachHang { get; set; } // Để tích điểm khách hàng thành viên
    public string? MaVoucher { get; set; } // Mã giảm giá áp dụng (Ví dụ: GIAM20K)
    public string? PhuongThucThanhToan { get; set; } // "TienMat" hoặc "ChuyenKhoan"

    // --- Danh sách chi tiết món ăn ---
    public List<CreateDonHangOnlineChiTietDto> ChiTiet { get; set; } = new();
}

public class CreateDonHangOnlineChiTietDto
{
    public int MaSanPham { get; set; }
    public string TenSize { get; set; } = null!;
    public int SoLuong { get; set; }
    public string? GhiChu { get; set; }
    public List<int> MaToppings { get; set; } = new();
}

public class CreateDonHangOnlineResultDto
{
    public int MaDonHang { get; set; }
    public string TrangThai { get; set; } = null!;
    public decimal TongTien { get; set; }
}