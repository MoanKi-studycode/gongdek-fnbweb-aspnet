using GongDek_Nhom20.DTOs.BaoCaoDtos;
using GongDek_Nhom20.Repositories;

namespace GongDek_Nhom20.Services;

/// <summary>Xử lý nghiệp vụ báo cáo doanh thu.</summary>
public class BaoCaoService : IBaoCaoService
{
    private readonly IBaoCaoRepository _repository;

    public BaoCaoService(IBaoCaoRepository repository)
    {
        _repository = repository;
    }

    #region Báo cáo doanh thu

    public (DateOnly Tu, DateOnly Den) ResolveDateRange(DateOnly? tuNgay, DateOnly? denNgay)
    {
        var homNay = DateOnly.FromDateTime(DateTime.Now);

        if (tuNgay == null && denNgay == null)
            return (homNay.AddDays(-29), homNay);

        var tu = tuNgay ?? homNay.AddDays(-29);
        var den = denNgay ?? homNay;

        if (tu > den)
            throw new InvalidOperationException("Từ ngày không được lớn hơn đến ngày.");

        return (tu, den);
    }

    public async Task<BaoCaoDoanhThuTongHopDto> GetBaoCaoDoanhThuAsync(DateOnly? tuNgay, DateOnly? denNgay)
    {
        var (tu, den) = ResolveDateRange(tuNgay, denNgay);
        return await _repository.GetBaoCaoDoanhThuAsync(tu, den);
    }

    #endregion
}
