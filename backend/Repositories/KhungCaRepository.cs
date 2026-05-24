using GongDek_Nhom20.Data;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Repositories;

/// <summary>Repository truy vấn bảng KhungCa.</summary>
public class KhungCaRepository : IKhungCaRepository
{
    private readonly GongDekDbContext _context;

    public KhungCaRepository(GongDekDbContext context)
    {
        _context = context;
    }

    #region Truy vấn khung ca

    public async Task<List<KhungCa>> GetActiveAsync()
    {
        return await _context.KhungCas
            .Where(k => k.TrangThai == TrangThaiKhungCa.HoatDong)
            .OrderBy(k => k.GioBatDau)
            .ToListAsync();
    }

    public async Task<KhungCa?> GetByIdAsync(int maKhungCa)
    {
        return await _context.KhungCas.FindAsync(maKhungCa);
    }

    #endregion
}
