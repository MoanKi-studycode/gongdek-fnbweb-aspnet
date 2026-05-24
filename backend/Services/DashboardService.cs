using GongDek_Nhom20.DTOs.DashboardDtos;
using GongDek_Nhom20.Repositories;

namespace GongDek_Nhom20.Services;

/// <summary>Xử lý tổng hợp dữ liệu dashboard quản trị.</summary>
public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;

    public DashboardService(IDashboardRepository repository)
    {
        _repository = repository;
    }

    #region Dashboard quản trị

    public async Task<DashboardTongQuanDto> GetTongQuanAsync()
    {
        var homNay = DateOnly.FromDateTime(DateTime.Now);
        var dauThang = new DateOnly(homNay.Year, homNay.Month, 1);
        var bayNgayTruoc = homNay.AddDays(-6);

        var doanhThuHomNay = await _repository.SumDoanhThuAsync(homNay, homNay);
        var doanhThuThang = await _repository.SumDoanhThuAsync(dauThang, homNay);
        var soHoaDonHomNay = await _repository.CountHoaDonAsync(homNay, homNay);
        var (taiQuay, online) = await _repository.CountDonTheoLoaiAsync(homNay);
        var soKhach = await _repository.CountKhachHomNayAsync(homNay);
        var khachMoi = await _repository.CountKhachMoiHomNayAsync(homNay);
        var choXacNhan = await _repository.CountDonOnlineChoXacNhanAsync();

        return new DashboardTongQuanDto
        {
            DoanhThuHomNay = doanhThuHomNay,
            DoanhThuThang = doanhThuThang,
            SoHoaDonHomNay = soHoaDonHomNay,
            SoDonTaiQuay = taiQuay,
            SoDonOnline = online,
            SoKhachHomNay = soKhach,
            KhachMoiHomNay = khachMoi,
            DonOnlineChoXacNhan = choXacNhan,
            TopSanPham = await _repository.GetTopSanPhamAsync(bayNgayTruoc, homNay, 5),
            DoanhThu7Ngay = await _repository.GetDoanhThuTheoNgayAsync(bayNgayTruoc, homNay),
            DonOnlineCho = await _repository.GetDonOnlineChoXacNhanAsync(10),
            NguyenLieuSapHet = await _repository.GetNguyenLieuCanhBaoAsync(10),
        };
    }

    public async Task<DoanhThuThongKeDto> GetDoanhThuAsync(DateOnly? tuNgay, DateOnly? denNgay)
    {
        var homNay = DateOnly.FromDateTime(DateTime.Now);
        var tu = tuNgay ?? homNay;
        var den = denNgay ?? homNay;

        if (tu > den)
            throw new InvalidOperationException("Từ ngày không được lớn hơn đến ngày.");

        return new DoanhThuThongKeDto
        {
            TuNgay = tu,
            DenNgay = den,
            TongDoanhThu = await _repository.SumDoanhThuAsync(tu, den),
            SoHoaDon = await _repository.CountHoaDonAsync(tu, den),
        };
    }

    public async Task<DonHomNayDto> GetDonHomNayAsync()
    {
        var homNay = DateOnly.FromDateTime(DateTime.Now);
        var (taiQuay, online) = await _repository.CountDonTheoLoaiAsync(homNay);
        var tong = await _repository.CountHoaDonAsync(homNay, homNay);
        var doanhThu = await _repository.SumDoanhThuAsync(homNay, homNay);

        return new DonHomNayDto
        {
            TongDon = tong,
            DonTaiQuay = taiQuay,
            DonOnline = online,
            TongDoanhThu = doanhThu,
        };
    }

    public async Task<List<TopSanPhamDto>> GetTopSanPhamAsync(int limit, DateOnly? tuNgay, DateOnly? denNgay)
    {
        var homNay = DateOnly.FromDateTime(DateTime.Now);
        var tu = tuNgay ?? homNay;
        var den = denNgay ?? homNay;

        if (limit <= 0 || limit > 50)
            limit = 5;

        return await _repository.GetTopSanPhamAsync(tu, den, limit);
    }

    public async Task<List<DonOnlineChoDto>> GetDonOnlineChoXacNhanAsync(int limit)
    {
        if (limit <= 0 || limit > 50)
            limit = 10;

        return await _repository.GetDonOnlineChoXacNhanAsync(limit);
    }

    public async Task<List<NguyenLieuCanhBaoDto>> GetCanhBaoNguyenLieuAsync(int limit)
    {
        if (limit <= 0 || limit > 50)
            limit = 10;

        return await _repository.GetNguyenLieuCanhBaoAsync(limit);
    }

    #endregion
}
