using GongDek_Nhom20.DTOs.ShiftDtos;

namespace GongDek_Nhom20.Services;

/// <summary>Nghiệp vụ khung ca làm việc — phụ trách: Trần Anh Tín.</summary>
public interface IKhungCaService
{
    Task<List<KhungCaDto>> GetActiveAsync();
}
