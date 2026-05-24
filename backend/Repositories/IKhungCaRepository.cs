using GongDek_Nhom20.Models;

namespace GongDek_Nhom20.Repositories;

/// <summary>Truy cập dữ liệu khung ca — phụ trách: Trần Anh Tín.</summary>
public interface IKhungCaRepository
{
    Task<List<KhungCa>> GetActiveAsync();
    Task<KhungCa?> GetByIdAsync(int maKhungCa);
}
