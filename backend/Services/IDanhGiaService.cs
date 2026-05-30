using GongDek_Nhom20.DTOs.DanhGiaDtos;

namespace GongDek_Nhom20.Services;

public interface IDanhGiaService
{
    Task<List<DanhGiaDto>> GetAllAsync();
    Task<List<DanhGiaDto>> GetBySanPhamAsync(int maSanPham);
    Task<List<DanhGiaTomTatDto>> GetAllSummariesAsync();
    Task<DanhGiaTomTatDto?> GetSummaryBySanPhamAsync(int maSanPham);
    Task<List<DanhGiaDto>> GetByHoaDonForCustomerAsync(int maKh, int maHoaDon);
    Task<DanhGiaDto> CreateAsync(int maKh, CreateDanhGiaDto dto);
}
