using GongDek_Nhom20.DTOs.ShiftDtos;

namespace GongDek_Nhom20.Services;

/// <summary>Nghiệp vụ ca làm việc — phụ trách: Trần Anh Tín.</summary>
public interface ICaLamViecService
{
    Task<List<CaLamViecDto>> GetHistoryAsync(
        DateOnly? tuNgay,
        DateOnly? denNgay,
        int? maNV,
        int? maKhungCa,
        string? trangThaiCa);

    Task<List<CaLamViecDto>> GetDangMoAsync(int? maNV = null);
    Task<CaLamViecDto> GetByIdAsync(int maCa);
    Task<CaLamViecDto> MoCaAsync(MoCaDto dto);
    Task<CaLamViecDto> DongCaAsync(int maCa, DongCaDto dto);
}
