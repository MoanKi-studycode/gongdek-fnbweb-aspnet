using GongDek_Nhom20.Data;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Repositories;

/// <summary>Repository truy váº¥n báº£ng NhanVien.</summary>
public class NhanVienRepository : INhanVienRepository
{
    private readonly GongDekDbContext _context;

    public NhanVienRepository(GongDekDbContext context)
    {
        _context = context;
    }

    #region Truy váº¥n danh sÃ¡ch nhÃ¢n viÃªn

    public async Task<List<NhanVien>> GetAllAsync(string? search, int? maVaiTro)
    {
        var query = _context.NhanViens
            .Include(n => n.VaiTro)
            .AsQueryable();

        if (maVaiTro.HasValue)
            query = query.Where(n => n.MaVaiTro == maVaiTro.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim().ToLower();
            query = query.Where(n =>
                n.HoTen.ToLower().Contains(keyword) ||
                n.TenDangNhap.ToLower().Contains(keyword) ||
                (n.SoDienThoai != null && n.SoDienThoai.Contains(keyword)));
        }

        return await query
            .OrderByDescending(n => n.NgayTao)
            .ToListAsync();
    }

    public async Task<NhanVien?> GetByIdAsync(int id)
    {
        return await _context.NhanViens
            .Include(n => n.VaiTro)
            .FirstOrDefaultAsync(n => n.MaNV == id);
    }

    #endregion

    #region Kiá»ƒm tra dá»¯ liá»‡u trÃ¹ng

    public async Task<bool> ExistsTenDangNhapAsync(string tenDangNhap, int? excludeMaNv = null)
    {
        var query = _context.NhanViens.Where(n => n.TenDangNhap == tenDangNhap);
        if (excludeMaNv.HasValue)
            query = query.Where(n => n.MaNV != excludeMaNv.Value);

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsSoDienThoaiAsync(string soDienThoai, int? excludeMaNv = null)
    {
        if (string.IsNullOrWhiteSpace(soDienThoai))
            return false;

        var query = _context.NhanViens.Where(n => n.SoDienThoai == soDienThoai);
        if (excludeMaNv.HasValue)
            query = query.Where(n => n.MaNV != excludeMaNv.Value);

        return await query.AnyAsync();
    }

    #endregion

    #region Vai trÃ² nhÃ¢n viÃªn

    public async Task<VaiTro?> GetVaiTroByIdAsync(int maVaiTro)
    {
        return await _context.VaiTros.FindAsync(maVaiTro);
    }

    public async Task<List<VaiTro>> GetVaiTroNhanVienAsync()
    {
        var allowed = new[] { TenVaiTro.QuanLy, TenVaiTro.NhanVien };
        return await _context.VaiTros
            .Where(v => allowed.Contains(v.TenVaiTro))
            .OrderBy(v => v.MaVaiTro)
            .ToListAsync();
    }

    #endregion

    #region Ghi dá»¯ liá»‡u

    public async Task AddAsync(NhanVien nhanVien)
    {
        await _context.NhanViens.AddAsync(nhanVien);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    #endregion
}


