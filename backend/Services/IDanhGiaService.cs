using GongDek_Nhom20.DTOs.DanhGiaDtos;

namespace GongDek_Nhom20.Services;

public interface IDanhGiaService
{
    Task<List<DanhGiaDto>> GetBySanPhamAsync(int maSanPham);
    Task<DanhGiaDto> CreateAsync(int maKh, CreateDanhGiaDto dto);
}
