using GongDek_Nhom20.Data;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Repositories;

/// <summary>Repository truy vấn bảng CaLamViec.</summary>
public class CaLamViecRepository : ICaLamViecRepository
{
    private readonly GongDekDbContext _context;

    public CaLamViecRepository(GongDekDbContext context)
    {
        _context = context;
    }

    #region Truy vấn ca làm việc

    public async Task<List<CaLamViec>> GetAllAsync(
        DateOnly? tuNgay,
        DateOnly? denNgay,
        int? maNV,
        int? maKhungCa,
        string? trangThaiCa)
    {
        var query = _context.CaLamViocs
            .Include(c => c.KhungCa)
            .Include(c => c.NhanVien)
            .AsQueryable();

        if (tuNgay.HasValue)
            query = query.Where(c => c.NgayLam >= tuNgay.Value);

        if (denNgay.HasValue)
            query = query.Where(c => c.NgayLam <= denNgay.Value);

        if (maNV.HasValue)
            query = query.Where(c => c.MaNV == maNV.Value);

        if (maKhungCa.HasValue)
            query = query.Where(c => c.MaKhungCa == maKhungCa.Value);

        if (!string.IsNullOrWhiteSpace(trangThaiCa))
            query = query.Where(c => c.TrangThaiCa == trangThaiCa);

        return await query
            .OrderByDescending(c => c.ThoiGianMo)
            .ToListAsync();
    }

    public async Task<List<CaLamViec>> GetDangMoAsync()
    {
        return await _context.CaLamViocs
            .Include(c => c.KhungCa)
            .Include(c => c.NhanVien)
            .Where(c => c.TrangThaiCa == TrangThaiCaLamViec.DangMo)
            .OrderByDescending(c => c.ThoiGianMo)
            .ToListAsync();
    }

    public async Task<CaLamViec?> GetByIdAsync(int maCa)
    {
        return await _context.CaLamViocs
            .Include(c => c.KhungCa)
            .Include(c => c.NhanVien)
            .FirstOrDefaultAsync(c => c.MaCa == maCa);
    }

    public async Task<bool> HasOpenShiftAsync(int maNV)
    {
        return await _context.CaLamViocs.AnyAsync(c =>
            c.MaNV == maNV && c.TrangThaiCa == TrangThaiCaLamViec.DangMo);
    }

    #endregion

    #region Ghi dữ liệu

    public async Task AddAsync(CaLamViec ca)
    {
        await _context.CaLamViocs.AddAsync(ca);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    #endregion
}
