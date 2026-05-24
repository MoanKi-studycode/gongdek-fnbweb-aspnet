using GongDek_Nhom20.DTOs.BaoCaoDtos;

namespace GongDek_Nhom20.Services;

public interface IBaoCaoService
{
    Task<BaoCaoDoanhThuTongHopDto> GetBaoCaoDoanhThuAsync(DateOnly? tuNgay, DateOnly? denNgay);
    (DateOnly Tu, DateOnly Den) ResolveDateRange(DateOnly? tuNgay, DateOnly? denNgay);
}
