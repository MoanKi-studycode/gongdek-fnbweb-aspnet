using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.InventoryDtos;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class NguyenLieuService : INguyenLieuService
{
    private static readonly string[] ValidStatuses = { "ConHang", "SapHet", "HetHang", "NgungSuDung" };
    private static readonly string[] ValidAdjustTypes = { "Nhap", "Xuat" };
    private readonly GongDekDbContext _context;

    public NguyenLieuService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<List<NguyenLieuDto>> GetAllAsync(string? search = null, string? trangThai = null, bool? canhBao = null)
    {
        var query = _context.NguyenLieus
            .AsNoTracking()
            .Include(n => n.ChiTietPhieuNhaps)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(n => n.TenNL.Contains(keyword) || n.DonViTinh.Contains(keyword));
        }

        if (!string.IsNullOrWhiteSpace(trangThai) && trangThai != "ALL")
        {
            query = query.Where(n => n.TrangThai == trangThai);
        }

        if (canhBao == true)
        {
            query = query.Where(n => n.SoLuongTon <= n.SoLuongCanhBao);
        }

        return await query
            .OrderBy(n => n.TenNL)
            .Select(n => ToDto(n))
            .ToListAsync();
    }

    public async Task<List<NguyenLieuDto>> GetCanhBaoTonKhoAsync()
    {
        return await GetAllAsync(canhBao: true);
    }

    public async Task<NguyenLieuDto?> GetByIdAsync(int id)
    {
        return await _context.NguyenLieus
            .AsNoTracking()
            .Include(n => n.ChiTietPhieuNhaps)
            .Where(n => n.MaNL == id)
            .Select(n => ToDto(n))
            .FirstOrDefaultAsync();
    }

    public async Task<NguyenLieuDto> CreateAsync(CreateNguyenLieuDto dto)
    {
        Validate(dto.TenNL, dto.DonViTinh, dto.SoLuongTon, dto.SoLuongCanhBao, dto.TrangThai);
        var tenNL = dto.TenNL.Trim();

        var isDuplicated = await _context.NguyenLieus.AnyAsync(n => n.TenNL == tenNL);
        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên nguyên liệu đã tồn tại.");
        }

        var entity = new NguyenLieu
        {
            TenNL = tenNL,
            DonViTinh = dto.DonViTinh.Trim(),
            SoLuongTon = dto.SoLuongTon,
            SoLuongCanhBao = dto.SoLuongCanhBao,
            HanSuDungGanNhat = dto.HanSuDungGanNhat,
            TrangThai = dto.TrangThai
        };

        _context.NguyenLieus.Add(entity);
        await _context.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<NguyenLieuDto?> UpdateAsync(int id, UpdateNguyenLieuDto dto)
    {
        Validate(dto.TenNL, dto.DonViTinh, dto.SoLuongTon, dto.SoLuongCanhBao, dto.TrangThai);

        var entity = await _context.NguyenLieus
            .Include(n => n.ChiTietPhieuNhaps)
            .FirstOrDefaultAsync(n => n.MaNL == id);
        if (entity == null) return null;

        var tenNL = dto.TenNL.Trim();
        var isDuplicated = await _context.NguyenLieus.AnyAsync(n => n.MaNL != id && n.TenNL == tenNL);
        if (isDuplicated)
        {
            throw new InvalidOperationException("Tên nguyên liệu đã tồn tại.");
        }

        entity.TenNL = tenNL;
        entity.DonViTinh = dto.DonViTinh.Trim();
        entity.SoLuongTon = dto.SoLuongTon;
        entity.SoLuongCanhBao = dto.SoLuongCanhBao;
        entity.HanSuDungGanNhat = dto.HanSuDungGanNhat;
        entity.TrangThai = dto.TrangThai;

        await _context.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<NguyenLieuDto?> DieuChinhTonKhoAsync(int id, DieuChinhTonKhoDto dto)
    {
        if (dto.SoLuong <= 0)
        {
            throw new InvalidOperationException("Số lượng điều chỉnh phải lớn hơn 0.");
        }

        if (string.IsNullOrWhiteSpace(dto.LoaiDieuChinh) || !ValidAdjustTypes.Contains(dto.LoaiDieuChinh))
        {
            throw new InvalidOperationException("Loại điều chỉnh chỉ được là Nhap hoặc Xuat.");
        }

        var entity = await _context.NguyenLieus
            .Include(n => n.ChiTietPhieuNhaps)
            .FirstOrDefaultAsync(n => n.MaNL == id);
        if (entity == null) return null;

        if (dto.LoaiDieuChinh == "Nhap")
        {
            entity.SoLuongTon += dto.SoLuong;
        }
        else
        {
            if (entity.SoLuongTon - dto.SoLuong < 0)
            {
                throw new InvalidOperationException("Số lượng xuất không được lớn hơn số lượng tồn.");
            }

            entity.SoLuongTon -= dto.SoLuong;
        }

        if (entity.SoLuongTon <= 0 && entity.TrangThai != "NgungSuDung")
        {
            entity.TrangThai = "HetHang";
        }
        else if (entity.SoLuongTon <= entity.SoLuongCanhBao && entity.TrangThai != "NgungSuDung")
        {
            entity.TrangThai = "SapHet";
        }
        else if (entity.TrangThai == "HetHang" || entity.TrangThai == "SapHet")
        {
            entity.TrangThai = "ConHang";
        }

        await _context.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.NguyenLieus
            .Include(n => n.ChiTietPhieuNhaps)
            .FirstOrDefaultAsync(n => n.MaNL == id);
        if (entity == null) return false;

        if (entity.ChiTietPhieuNhaps.Any())
        {
            throw new InvalidOperationException("Không thể xóa nguyên liệu đã có phiếu nhập kho. Hãy chuyển trạng thái sang Ngừng sử dụng.");
        }

        _context.NguyenLieus.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    private static void Validate(string? tenNL, string? donViTinh, decimal soLuongTon, decimal soLuongCanhBao, string? trangThai)
    {
        if (string.IsNullOrWhiteSpace(tenNL))
        {
            throw new InvalidOperationException("Tên nguyên liệu không được để trống.");
        }

        if (tenNL.Trim().Length > 150)
        {
            throw new InvalidOperationException("Tên nguyên liệu không được vượt quá 150 ký tự.");
        }

        if (string.IsNullOrWhiteSpace(donViTinh))
        {
            throw new InvalidOperationException("Đơn vị tính không được để trống.");
        }

        if (donViTinh.Trim().Length > 20)
        {
            throw new InvalidOperationException("Đơn vị tính không được vượt quá 20 ký tự.");
        }

        if (soLuongTon < 0)
        {
            throw new InvalidOperationException("Số lượng tồn không được âm.");
        }

        if (soLuongCanhBao < 0)
        {
            throw new InvalidOperationException("Số lượng cảnh báo không được âm.");
        }

        if (string.IsNullOrWhiteSpace(trangThai) || !ValidStatuses.Contains(trangThai))
        {
            throw new InvalidOperationException("Trạng thái nguyên liệu chỉ được là ConHang, SapHet, HetHang hoặc NgungSuDung.");
        }
    }

    private static NguyenLieuDto ToDto(NguyenLieu entity)
    {
        return new NguyenLieuDto
        {
            MaNL = entity.MaNL,
            TenNL = entity.TenNL,
            DonViTinh = entity.DonViTinh,
            SoLuongTon = entity.SoLuongTon,
            SoLuongCanhBao = entity.SoLuongCanhBao,
            HanSuDungGanNhat = entity.HanSuDungGanNhat,
            TrangThai = entity.TrangThai,
            CanhBaoTonKho = entity.SoLuongTon <= entity.SoLuongCanhBao,
            SoLanNhap = entity.ChiTietPhieuNhaps?.Count ?? 0
        };
    }
}
