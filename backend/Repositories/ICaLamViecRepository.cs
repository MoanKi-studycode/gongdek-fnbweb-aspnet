using GongDek_Nhom20.Models;

namespace GongDek_Nhom20.Repositories;

/// <summary>Truy cập dữ liệu ca làm việc — phụ trách: Trần Anh Tín.</summary>
public interface ICaLamViecRepository
{
    Task<List<CaLamViec>> GetAllAsync(
        DateOnly? tuNgay,
        DateOnly? denNgay,
        int? maNV,
        int? maKhungCa,
        string? trangThaiCa);

    Task<List<CaLamViec>> GetDangMoAsync();
    Task<CaLamViec?> GetByIdAsync(int maCa);
    Task<bool> HasOpenShiftAsync(int maNV);
    Task AddAsync(CaLamViec ca);
    Task SaveChangesAsync();
}
