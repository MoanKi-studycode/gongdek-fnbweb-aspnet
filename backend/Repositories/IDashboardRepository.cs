using GongDek_Nhom20.DTOs.DashboardDtos;

namespace GongDek_Nhom20.Repositories;

/// <summary>Truy vấn dữ liệu báo cáo dashboard — phụ trách: Trần Anh Tín.</summary>
public interface IDashboardRepository
{
    Task<decimal> SumDoanhThuAsync(DateOnly tuNgay, DateOnly denNgay);
    Task<int> CountHoaDonAsync(DateOnly tuNgay, DateOnly denNgay);
    Task<(int TaiQuay, int Online)> CountDonTheoLoaiAsync(DateOnly ngay);
    Task<int> CountKhachHomNayAsync(DateOnly ngay);
    Task<int> CountKhachMoiHomNayAsync(DateOnly ngay);
    Task<List<TopSanPhamDto>> GetTopSanPhamAsync(DateOnly tuNgay, DateOnly denNgay, int limit);
    Task<List<DoanhThuNgayDto>> GetDoanhThuTheoNgayAsync(DateOnly tuNgay, DateOnly denNgay);
    Task<int> CountDonOnlineChoXacNhanAsync();
    Task<List<DonOnlineChoDto>> GetDonOnlineChoXacNhanAsync(int limit);
    Task<List<NguyenLieuCanhBaoDto>> GetNguyenLieuCanhBaoAsync(int limit);
}
