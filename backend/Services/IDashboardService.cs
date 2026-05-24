using GongDek_Nhom20.DTOs.DashboardDtos;

namespace GongDek_Nhom20.Services;

/// <summary>Nghiệp vụ dashboard và báo cáo — phụ trách: Trần Anh Tín.</summary>
public interface IDashboardService
{
    Task<DashboardTongQuanDto> GetTongQuanAsync();
    Task<DoanhThuThongKeDto> GetDoanhThuAsync(DateOnly? tuNgay, DateOnly? denNgay);
    Task<DonHomNayDto> GetDonHomNayAsync();
    Task<List<TopSanPhamDto>> GetTopSanPhamAsync(int limit, DateOnly? tuNgay, DateOnly? denNgay);
    Task<List<DonOnlineChoDto>> GetDonOnlineChoXacNhanAsync(int limit);
    Task<List<NguyenLieuCanhBaoDto>> GetCanhBaoNguyenLieuAsync(int limit);
}
