using System.Security.Claims;
using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.OrderWrite;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>Tạo đơn hàng online từ giỏ khách đã đăng nhập.</summary>
public class DonHangOnlineWriteService : IDonHangOnlineWriteService
{
    private const decimal PhiGiaoHangMacDinh = 15000m;

    private readonly GongDekDbContext _context;

    public DonHangOnlineWriteService(GongDekDbContext context)
    {
        _context = context;
    }

    public async Task<CreateDonHangOnlineResultDto> CreateAsync(ClaimsPrincipal principal, CreateDonHangOnlineDto dto)
    {
        if (principal.FindFirst("user_type")?.Value != "customer")
            throw new UnauthorizedAccessException("Chỉ khách hàng mới được đặt hàng online.");

        var fromClaims = JwtHelper.GetUserFromClaims(principal);
        if (fromClaims == null || fromClaims.VaiTro != TenVaiTro.KhachHang)
            throw new UnauthorizedAccessException("Chỉ khách hàng mới được đặt hàng online.");

        var diaChi = dto.DiaChiGiao?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(diaChi))
            throw new InvalidOperationException("Địa chỉ giao hàng là bắt buộc.");

        if (dto.ChiTiet == null || dto.ChiTiet.Count == 0)
            throw new InvalidOperationException("Giỏ hàng trống, không thể đặt hàng.");

        var khachHang = await _context.KhachHangs.FindAsync(fromClaims.Id);
        if (khachHang == null || khachHang.TrangThai != "HoatDong")
            throw new UnauthorizedAccessException("Tài khoản khách hàng không hợp lệ.");

        var maNvLap = await _context.NhanViens
            .Include(n => n.VaiTro)
            .Where(n => n.TrangThai == TrangThaiNhanVien.HoatDong && n.VaiTro.TenVaiTro == TenVaiTro.QuanLy)
            .OrderBy(n => n.MaNV)
            .Select(n => n.MaNV)
            .FirstOrDefaultAsync();

        if (maNvLap == 0)
            throw new InvalidOperationException("Hệ thống chưa cấu hình nhân viên lập đơn online.");

        var sizes = await _context.Sizes
            .Where(s => s.TrangThai == "DangApDung")
            .ToDictionaryAsync(s => s.TenSize.ToUpperInvariant(), s => s);

        if (!sizes.ContainsKey("M") || !sizes.ContainsKey("L"))
            throw new InvalidOperationException("Thiếu cấu hình size M/L trong hệ thống.");

        decimal tongTienMon = 0;
        var chiTietEntities = new List<(ChiTietHoaDon Line, List<ChiTietHoaDonTopping> Toppings)>();

        foreach (var item in dto.ChiTiet)
        {
            if (item.SoLuong < 1)
                throw new InvalidOperationException("Số lượng mỗi món phải lớn hơn 0.");

            var tenSize = (item.TenSize ?? string.Empty).Trim().ToUpperInvariant();
            if (!sizes.TryGetValue(tenSize, out var size))
                throw new InvalidOperationException($"Size '{item.TenSize}' không hợp lệ.");

            var sanPham = await _context.SanPhams.FindAsync(item.MaSanPham);
            if (sanPham == null || sanPham.TrangThai != "DangBan")
                throw new InvalidOperationException($"Sản phẩm #{item.MaSanPham} không khả dụng.");

            var toppingRows = new List<ChiTietHoaDonTopping>();
            decimal toppingTotal = 0;

            if (item.MaToppings?.Count > 0)
            {
                var distinctIds = item.MaToppings.Distinct().ToList();
                var toppings = await _context.Toppings
                    .Where(t => distinctIds.Contains(t.MaTopping) && t.TrangThai == "DangBan")
                    .ToListAsync();

                if (toppings.Count != distinctIds.Count)
                    throw new InvalidOperationException("Một hoặc nhiều topping không hợp lệ.");

                foreach (var topping in toppings)
                {
                    toppingTotal += topping.DonGia;
                    toppingRows.Add(new ChiTietHoaDonTopping
                    {
                        MaTopping = topping.MaTopping,
                        DonGiaTopping = topping.DonGia,
                        SoLuong = 1,
                    });
                }
            }

            var unitPrice = sanPham.GiaBanGoc + size.PhuThu + toppingTotal;
            var thanhTien = unitPrice * item.SoLuong;
            tongTienMon += thanhTien;

            chiTietEntities.Add((
                new ChiTietHoaDon
                {
                    MaSanPham = sanPham.MaSanPham,
                    MaSize = size.MaSize,
                    SoLuong = item.SoLuong,
                    DonGiaGoc = sanPham.GiaBanGoc,
                    PhuThuSize = size.PhuThu,
                    ThanhTien = thanhTien,
                    GhiChu = string.IsNullOrWhiteSpace(item.GhiChu) ? null : item.GhiChu.Trim(),
                },
                toppingRows));
        }

        var tongThanhToan = tongTienMon + PhiGiaoHangMacDinh;
        var now = DateTime.UtcNow;

        var hoaDon = new HoaDon
        {
            LoaiDon = LoaiDon.Online,
            TrangThaiHoaDon = TrangThaiHoaDon.DaThanhToan,
            MaKH = khachHang.MaKH,
            MaNVLap = maNvLap,
            MaCa = null,
            TongTienMon = tongTienMon,
            PhiGiaoHang = PhiGiaoHangMacDinh,
            TienGiamGia = 0,
            DiemSuDung = 0,
            TongThanhToan = tongThanhToan,
            PhuongThucThanhToan = "ChuyenKhoan",
            ThoiGianLap = now,
            ThoiGianThanhToan = now,
        };

        _context.HoaDons.Add(hoaDon);
        await _context.SaveChangesAsync();

        foreach (var (line, toppings) in chiTietEntities)
        {
            line.MaHoaDon = hoaDon.MaHoaDon;
            _context.ChiTietHoaDons.Add(line);
            await _context.SaveChangesAsync();

            foreach (var topping in toppings)
            {
                topping.MaChiTiet = line.MaChiTiet;
                _context.ChiTietHoaDonToppings.Add(topping);
            }
        }

        var donOnline = new DonHangOnline
        {
            MaHoaDon = hoaDon.MaHoaDon,
            HoTenNhanHang = khachHang.HoTen,
            SoDienThoaiNhan = khachHang.SoDienThoai,
            DiaChiGiao = diaChi,
            GhiChuGiaoHang = string.IsNullOrWhiteSpace(dto.GhiChuGiaoHang) ? null : dto.GhiChuGiaoHang.Trim(),
            TrangThaiOnline = TrangThaiDonHangOnline.ChoXacNhan,
        };

        _context.DonHangOnlines.Add(donOnline);
        await _context.SaveChangesAsync();

        return new CreateDonHangOnlineResultDto
        {
            MaHoaDon = hoaDon.MaHoaDon,
            TrangThaiOnline = donOnline.TrangThaiOnline,
        };
    }
}
