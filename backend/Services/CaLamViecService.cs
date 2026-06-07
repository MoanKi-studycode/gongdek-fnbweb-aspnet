using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.ShiftDtos;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Models;
using GongDek_Nhom20.Repositories;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>Xử lý nghiệp vụ mở ca, đóng ca và lịch sử ca làm việc.</summary>
public class CaLamViecService : ICaLamViecService
{
    private readonly ICaLamViecRepository _caRepository;
    private readonly IKhungCaRepository _khungCaRepository;
    private readonly INhanVienRepository _nhanVienRepository;
    private readonly GongDekDbContext _context;

    public CaLamViecService(
        ICaLamViecRepository caRepository,
        IKhungCaRepository khungCaRepository,
        INhanVienRepository nhanVienRepository,
        GongDekDbContext context)
    {
        _caRepository = caRepository;
        _khungCaRepository = khungCaRepository;
        _nhanVienRepository = nhanVienRepository;
        _context = context;
    }

    #region Quản lý ca làm việc

    public async Task<List<CaLamViecDto>> GetHistoryAsync(
        DateOnly? tuNgay,
        DateOnly? denNgay,
        int? maNV,
        int? maKhungCa,
        string? trangThaiCa)
    {
        var items = await _caRepository.GetAllAsync(tuNgay, denNgay, maNV, maKhungCa, trangThaiCa);
        return items.Select(MapToDto).ToList();
    }

    public async Task<List<CaLamViecDto>> GetDangMoAsync(int? maNV = null)
    {
        var items = await _caRepository.GetDangMoAsync(maNV);
        return items.Select(MapToDto).ToList();
    }

    public async Task<CaLamViecDto> GetByIdAsync(int maCa)
    {
        var ca = await _caRepository.GetByIdAsync(maCa)
            ?? throw new KeyNotFoundException("Không tìm thấy ca làm việc.");

        return MapToDto(ca);
    }

    public async Task<DongCaTomTatDto> GetDongCaTomTatAsync(int maCa)
    {
        var ca = await _caRepository.GetByIdAsync(maCa)
            ?? throw new KeyNotFoundException("Không tìm thấy ca làm việc.");

        if (ca.TrangThaiCa != TrangThaiCaLamViec.DangMo)
            throw new InvalidOperationException("Chỉ tóm tắt được ca đang mở.");

        var hoaDons = await _context.HoaDons
            .AsNoTracking()
            .Where(h => h.MaCa == maCa && h.TrangThaiHoaDon != TrangThaiHoaDon.DaHuy)
            .ToListAsync();

        var tongTienMat = hoaDons
            .Where(h => h.PhuongThucThanhToan == PhuongThucThanhToan.TienMat)
            .Sum(h => h.TongThanhToan);

        return new DongCaTomTatDto
        {
            MaCa = maCa,
            TienQuyDauCa = ca.TienQuyDauCa,
            TongTienMatTrongCa = tongTienMat,
            TienMatKyVong = ca.TienQuyDauCa + tongTienMat,
            SoHoaDonTienMat = hoaDons.Count(h => h.PhuongThucThanhToan == PhuongThucThanhToan.TienMat),
            TongSoHoaDon = hoaDons.Count,
        };
    }

    public async Task<CaLamViecDto> MoCaAsync(MoCaDto dto)
    {
        var khungCa = await _khungCaRepository.GetByIdAsync(dto.MaKhungCa)
            ?? throw new InvalidOperationException("Khung ca không tồn tại.");

        if (khungCa.TrangThai != TrangThaiKhungCa.HoatDong)
            throw new InvalidOperationException("Khung ca không còn hoạt động.");

        var nhanVien = await _nhanVienRepository.GetByIdAsync(dto.MaNV)
            ?? throw new InvalidOperationException("Nhân viên không tồn tại.");

        if (nhanVien.TrangThai != TrangThaiNhanVien.HoatDong)
            throw new InvalidOperationException("Nhân viên không ở trạng thái hoạt động.");

        if (await _caRepository.HasOpenShiftAsync(dto.MaNV))
            throw new InvalidOperationException("Nhân viên đang có ca mở. Vui lòng đóng ca trước khi mở ca mới.");

        var ngayLam = dto.NgayLam ?? DateOnly.FromDateTime(DateTime.Now);

        var ca = new CaLamViec
        {
            MaKhungCa = dto.MaKhungCa,
            MaNV = dto.MaNV,
            NgayLam = ngayLam,
            ThoiGianMo = DateTime.UtcNow,
            TienQuyDauCa = dto.TienQuyDauCa,
            TrangThaiCa = TrangThaiCaLamViec.DangMo,
            GhiChu = dto.GhiChu,
        };

        await _caRepository.AddAsync(ca);
        await _caRepository.SaveChangesAsync();

        var created = await _caRepository.GetByIdAsync(ca.MaCa)
            ?? throw new InvalidOperationException("Không thể tải ca vừa mở.");

        return MapToDto(created);
    }

    public async Task<CaLamViecDto> DongCaAsync(int maCa, DongCaDto dto)
    {
        var ca = await _caRepository.GetByIdAsync(maCa)
            ?? throw new KeyNotFoundException("Không tìm thấy ca làm việc.");

        if (ca.TrangThaiCa != TrangThaiCaLamViec.DangMo)
            throw new InvalidOperationException("Ca đã đóng hoặc không hợp lệ.");

        ca.ThoiGianDong = DateTime.UtcNow;
        ca.TienMatThucTe = dto.TienMatThucTe;
        ca.TrangThaiCa = TrangThaiCaLamViec.DaDong;

        if (!string.IsNullOrWhiteSpace(dto.GhiChu))
            ca.GhiChu = string.IsNullOrWhiteSpace(ca.GhiChu)
                ? dto.GhiChu.Trim()
                : $"{ca.GhiChu} | {dto.GhiChu.Trim()}";

        await _caRepository.SaveChangesAsync();

        return MapToDto(ca);
    }

    #endregion

    #region Hàm hỗ trợ nội bộ

    private static CaLamViecDto MapToDto(CaLamViec ca)
    {
        return new CaLamViecDto
        {
            MaCa = ca.MaCa,
            MaKhungCa = ca.MaKhungCa,
            TenCa = ca.KhungCa.TenCa,
            MaNV = ca.MaNV,
            HoTenNV = ca.NhanVien.HoTen,
            NgayLam = ca.NgayLam,
            ThoiGianMo = ca.ThoiGianMo,
            ThoiGianDong = ca.ThoiGianDong,
            TienQuyDauCa = ca.TienQuyDauCa,
            TienMatThucTe = ca.TienMatThucTe,
            TrangThaiCa = ca.TrangThaiCa,
            GhiChu = ca.GhiChu,
        };
    }

    #endregion
}
