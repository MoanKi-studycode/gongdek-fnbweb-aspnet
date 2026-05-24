using GongDek_Nhom20.DTOs.BaoCaoDtos;

namespace GongDek_Nhom20.Repositories;

public interface IBaoCaoRepository
{
    Task<BaoCaoDoanhThuTongHopDto> GetBaoCaoDoanhThuAsync(DateOnly tuNgay, DateOnly denNgay);
}
