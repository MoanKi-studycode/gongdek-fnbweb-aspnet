using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.InventoryDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class PhieuNhapKhoService : IPhieuNhapKhoService
{
    private readonly GongDekDbContext _context;

    private const string ChoDuyet = "ChoDuyet";
    private const string DaDuyet = "DaDuyet";
    private const string Huy = "Huy";

    public PhieuNhapKhoService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<PhieuNhapKhoDto>> GetAllAsync(string? trangThai = null, int? maNCC = null, DateOnly? tuNgay = null, DateOnly? denNgay = null)
    {
        var query = BaseQuery();

        if (!string.IsNullOrWhiteSpace(trangThai) && trangThai != "ALL")
        {
            query = query.Where(p => p.TrangThaiPhieu == trangThai);
        }

        if (maNCC.HasValue && maNCC.Value > 0)
        {
            query = query.Where(p => p.MaNCC == maNCC.Value);
        }

        if (tuNgay.HasValue)
        {
            query = query.Where(p => p.NgayNhap >= tuNgay.Value);
        }

        if (denNgay.HasValue)
        {
            query = query.Where(p => p.NgayNhap <= denNgay.Value);
        }

        var data = await query
            .OrderByDescending(p => p.MaPhieuNhap)
            .ToListAsync();

        return data.Select(ToDto).ToList();
    }

    public async Task<PhieuNhapKhoDto?> GetByIdAsync(int id)
    {
        var entity = await BaseQuery().FirstOrDefaultAsync(p => p.MaPhieuNhap == id);
        return entity == null ? null : ToDto(entity);
    }

    public async Task<PhieuNhapKhoDto> CreateAsync(CreatePhieuNhapKhoDto dto, int? maNVLap)
    {
        await ValidateInputAsync(dto);
        var creatorId = await ResolveNhanVienLapAsync(maNVLap);

        var entity = new PhieuNhapKho
        {
            MaNCC = dto.MaNCC,
            MaNVLap = creatorId,
            NgayNhap = dto.NgayNhap ?? DateOnly.FromDateTime(DateTime.Now),
            TrangThaiPhieu = ChoDuyet,
            GhiChu = NormalizeNullable(dto.GhiChu),
            ChiTietPhieuNhaps = dto.ChiTiet.Select(item => new ChiTietPhieuNhap
            {
                MaNL = item.MaNL,
                SoLuongNhap = item.SoLuongNhap,
                DonGiaNhap = item.DonGiaNhap,
                HanSuDung = item.HanSuDung,
                ThanhTien = item.SoLuongNhap * item.DonGiaNhap
            }).ToList()
        };

        entity.TongTienNhap = entity.ChiTietPhieuNhaps.Sum(c => c.ThanhTien);

        await _context.PhieuNhapKhos.AddAsync(entity);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(entity.MaPhieuNhap)
            ?? throw new InvalidOperationException("Không lấy được phiếu nhập vừa tạo.");
    }

    public async Task<PhieuNhapKhoDto> UpdateAsync(int id, UpdatePhieuNhapKhoDto dto)
    {
        await ValidateInputAsync(dto);

        var entity = await _context.PhieuNhapKhos
            .Include(p => p.ChiTietPhieuNhaps)
            .FirstOrDefaultAsync(p => p.MaPhieuNhap == id)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu nhập kho.");

        if (entity.TrangThaiPhieu != ChoDuyet)
        {
            throw new InvalidOperationException("Chỉ được sửa phiếu nhập kho đang chờ duyệt.");
        }

        entity.MaNCC = dto.MaNCC;
        entity.NgayNhap = dto.NgayNhap ?? entity.NgayNhap;
        entity.GhiChu = NormalizeNullable(dto.GhiChu);

        _context.ChiTietPhieuNhaps.RemoveRange(entity.ChiTietPhieuNhaps);
        entity.ChiTietPhieuNhaps = dto.ChiTiet.Select(item => new ChiTietPhieuNhap
        {
            MaPhieuNhap = id,
            MaNL = item.MaNL,
            SoLuongNhap = item.SoLuongNhap,
            DonGiaNhap = item.DonGiaNhap,
            HanSuDung = item.HanSuDung,
            ThanhTien = item.SoLuongNhap * item.DonGiaNhap
        }).ToList();

        entity.TongTienNhap = entity.ChiTietPhieuNhaps.Sum(c => c.ThanhTien);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id)
            ?? throw new InvalidOperationException("Không lấy được phiếu nhập sau khi cập nhật.");
    }

    public async Task<PhieuNhapKhoDto> CancelAsync(int id, string? ghiChu = null)
    {
        var entity = await _context.PhieuNhapKhos.FirstOrDefaultAsync(p => p.MaPhieuNhap == id)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu nhập kho.");

        if (entity.TrangThaiPhieu != ChoDuyet)
        {
            throw new InvalidOperationException("Chỉ được hủy phiếu nhập kho đang chờ duyệt.");
        }

        entity.TrangThaiPhieu = Huy;
        if (!string.IsNullOrWhiteSpace(ghiChu))
        {
            entity.GhiChu = NormalizeNullable(ghiChu);
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id)
            ?? throw new InvalidOperationException("Không lấy được phiếu nhập sau khi hủy.");
    }



    public async Task<PhieuNhapKhoDto> ApproveAsync(int id, int? maNVDuyet, string? ghiChu = null)
    {
        var entity = await _context.PhieuNhapKhos
            .Include(p => p.ChiTietPhieuNhaps)
            .FirstOrDefaultAsync(p => p.MaPhieuNhap == id)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu nhập kho.");

        if (entity.TrangThaiPhieu != ChoDuyet)
        {
            throw new InvalidOperationException("Chỉ được duyệt phiếu nhập kho đang chờ duyệt.");
        }

        if (entity.ChiTietPhieuNhaps.Count == 0)
        {
            throw new InvalidOperationException("Phiếu nhập không có chi tiết nguyên liệu.");
        }

        var approverId = await ResolveNhanVienLapAsync(maNVDuyet);
        var ingredientIds = entity.ChiTietPhieuNhaps.Select(c => c.MaNL).Distinct().ToList();
        var ingredients = await _context.NguyenLieus
            .Where(n => ingredientIds.Contains(n.MaNL))
            .ToDictionaryAsync(n => n.MaNL);

        if (ingredients.Count != ingredientIds.Count)
        {
            throw new InvalidOperationException("Có nguyên liệu trong phiếu nhập không tồn tại.");
        }

        foreach (var detail in entity.ChiTietPhieuNhaps)
        {
            var ingredient = ingredients[detail.MaNL];
            ingredient.SoLuongTon += detail.SoLuongNhap;

            if (detail.HanSuDung.HasValue &&
                (!ingredient.HanSuDungGanNhat.HasValue || detail.HanSuDung.Value < ingredient.HanSuDungGanNhat.Value))
            {
                ingredient.HanSuDungGanNhat = detail.HanSuDung.Value;
            }

            UpdateIngredientStatusByStock(ingredient);
        }

        entity.MaNVDuyet = approverId;
        entity.NgayDuyet = DateTime.Now;
        entity.TrangThaiPhieu = DaDuyet;
        if (!string.IsNullOrWhiteSpace(ghiChu))
        {
            entity.GhiChu = NormalizeNullable(ghiChu);
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id)
            ?? throw new InvalidOperationException("Không lấy được phiếu nhập sau khi duyệt.");
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _context.PhieuNhapKhos
            .Include(p => p.ChiTietPhieuNhaps)
            .FirstOrDefaultAsync(p => p.MaPhieuNhap == id)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu nhập kho.");

        if (entity.TrangThaiPhieu != ChoDuyet && entity.TrangThaiPhieu != Huy)
        {
            throw new InvalidOperationException("Chỉ được xóa phiếu nhập chờ duyệt hoặc đã hủy.");
        }

        _context.PhieuNhapKhos.Remove(entity);
        await _context.SaveChangesAsync();
    }

    private IQueryable<PhieuNhapKho> BaseQuery()
    {
        return _context.PhieuNhapKhos
            .AsNoTracking()
            .Include(p => p.NhaCungCap)
            .Include(p => p.NhanVienLap)
            .Include(p => p.NhanVienDuyet)
            .Include(p => p.ChiTietPhieuNhaps)
                .ThenInclude(c => c.NguyenLieu);
    }

    private async Task ValidateInputAsync(CreatePhieuNhapKhoDto dto)
    {
        if (dto.MaNCC <= 0)
        {
            throw new InvalidOperationException("Vui lòng chọn nhà cung cấp.");
        }

        var supplierExists = await _context.NhaCungCaps.AnyAsync(n => n.MaNCC == dto.MaNCC);
        if (!supplierExists)
        {
            throw new InvalidOperationException("Nhà cung cấp không tồn tại.");
        }

        if (dto.ChiTiet == null || dto.ChiTiet.Count == 0)
        {
            throw new InvalidOperationException("Phiếu nhập phải có ít nhất một nguyên liệu.");
        }

        var duplicated = dto.ChiTiet
            .GroupBy(x => x.MaNL)
            .FirstOrDefault(g => g.Count() > 1);
        if (duplicated != null)
        {
            throw new InvalidOperationException("Một nguyên liệu không được nhập lặp lại trong cùng phiếu.");
        }

        foreach (var item in dto.ChiTiet)
        {
            if (item.MaNL <= 0)
            {
                throw new InvalidOperationException("Vui lòng chọn nguyên liệu.");
            }

            if (item.SoLuongNhap <= 0)
            {
                throw new InvalidOperationException("Số lượng nhập phải lớn hơn 0.");
            }

            if (item.DonGiaNhap < 0)
            {
                throw new InvalidOperationException("Đơn giá nhập không được âm.");
            }
        }

        var ingredientIds = dto.ChiTiet.Select(x => x.MaNL).ToList();
        var existingCount = await _context.NguyenLieus.CountAsync(n => ingredientIds.Contains(n.MaNL));
        if (existingCount != ingredientIds.Count)
        {
            throw new InvalidOperationException("Có nguyên liệu không tồn tại.");
        }
    }

    private async Task<int> ResolveNhanVienLapAsync(int? maNVLap)
    {
        if (maNVLap.HasValue && maNVLap.Value > 0)
        {
            var exists = await _context.NhanViens.AnyAsync(n => n.MaNV == maNVLap.Value);
            if (exists) return maNVLap.Value;
        }

        var firstNhanVien = await _context.NhanViens
            .OrderBy(n => n.MaNV)
            .Select(n => n.MaNV)
            .FirstOrDefaultAsync();

        if (firstNhanVien <= 0)
        {
            throw new InvalidOperationException("Chưa có nhân viên để lập phiếu nhập kho.");
        }

        return firstNhanVien;
    }

    private static PhieuNhapKhoDto ToDto(PhieuNhapKho entity)
    {
        return new PhieuNhapKhoDto
        {
            MaPhieuNhap = entity.MaPhieuNhap,
            MaNCC = entity.MaNCC,
            TenNCC = entity.NhaCungCap?.TenNCC ?? string.Empty,
            MaNVLap = entity.MaNVLap,
            TenNVLap = entity.NhanVienLap?.HoTen ?? string.Empty,
            MaNVDuyet = entity.MaNVDuyet,
            TenNVDuyet = entity.NhanVienDuyet?.HoTen,
            NgayNhap = entity.NgayNhap,
            NgayDuyet = entity.NgayDuyet,
            TrangThaiPhieu = entity.TrangThaiPhieu,
            TongTienNhap = entity.TongTienNhap,
            GhiChu = entity.GhiChu,
            ChiTiet = entity.ChiTietPhieuNhaps
                .OrderBy(c => c.MaChiTietNhap)
                .Select(c => new ChiTietPhieuNhapDto
                {
                    MaChiTietNhap = c.MaChiTietNhap,
                    MaNL = c.MaNL,
                    TenNL = c.NguyenLieu?.TenNL ?? string.Empty,
                    DonViTinh = c.NguyenLieu?.DonViTinh ?? string.Empty,
                    SoLuongNhap = c.SoLuongNhap,
                    DonGiaNhap = c.DonGiaNhap,
                    HanSuDung = c.HanSuDung,
                    ThanhTien = c.ThanhTien
                })
                .ToList()
        };
    }



    private static void UpdateIngredientStatusByStock(NguyenLieu ingredient)
    {
        if (ingredient.TrangThai == "NgungSuDung")
        {
            return;
        }

        if (ingredient.SoLuongTon <= 0)
        {
            ingredient.TrangThai = "HetHang";
        }
        else if (ingredient.SoLuongTon <= ingredient.SoLuongCanhBao)
        {
            ingredient.TrangThai = "SapHet";
        }
        else
        {
            ingredient.TrangThai = "ConHang";
        }
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
