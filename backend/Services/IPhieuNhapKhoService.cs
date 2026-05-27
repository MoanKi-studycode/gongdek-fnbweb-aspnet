using GongDek_Nhom20.DTOs.InventoryDtos;

namespace GongDek_Nhom20.Services;

public interface IPhieuNhapKhoService
{
    Task<List<PhieuNhapKhoDto>> GetAllAsync(string? trangThai = null, int? maNCC = null, DateOnly? tuNgay = null, DateOnly? denNgay = null);
    Task<PhieuNhapKhoDto?> GetByIdAsync(int id);
    Task<PhieuNhapKhoDto> CreateAsync(CreatePhieuNhapKhoDto dto, int? maNVLap);
    Task<PhieuNhapKhoDto> UpdateAsync(int id, UpdatePhieuNhapKhoDto dto);
    Task<PhieuNhapKhoDto> CancelAsync(int id, string? ghiChu = null);
    Task<PhieuNhapKhoDto> ApproveAsync(int id, int? maNVDuyet, string? ghiChu = null);
    Task DeleteAsync(int id);
}
