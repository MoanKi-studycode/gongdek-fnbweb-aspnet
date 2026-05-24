using GongDek_Nhom20.Models;

namespace GongDek_Nhom20.Repositories;

/// <summary>Truy cập dữ liệu nhân viên — phụ trách: Trần Anh Tín.</summary>
public interface INhanVienRepository
{
    Task<List<NhanVien>> GetAllAsync(string? search, int? maVaiTro);
    Task<NhanVien?> GetByIdAsync(int id);
    Task<bool> ExistsTenDangNhapAsync(string tenDangNhap, int? excludeMaNv = null);
    Task<bool> ExistsSoDienThoaiAsync(string soDienThoai, int? excludeMaNv = null);
    Task<VaiTro?> GetVaiTroByIdAsync(int maVaiTro);
    Task<List<VaiTro>> GetVaiTroNhanVienAsync();
    Task AddAsync(NhanVien nhanVien);
    Task SaveChangesAsync();
}
