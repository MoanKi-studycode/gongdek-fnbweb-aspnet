using System.Security.Claims;
using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.OrderWrite;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

public class DonHangOnlineWriteService : IDonHangOnlineWriteService
{
    private readonly GongDekDbContext _context;
    private readonly IVoucherService _voucherService;

    public DonHangOnlineWriteService(GongDekDbContext context, IVoucherService voucherService)
    {
        _context = context;
        _voucherService = voucherService;
    }

    public async Task<CreateDonHangOnlineResultDto> CreateAsync(ClaimsPrincipal principal, CreateDonHangOnlineDto dto)
    {
        if (principal.FindFirst("user_type")?.Value != "customer")
            throw new UnauthorizedAccessException("Chỉ khách hàng mới được đặt hàng online.");

        var fromClaims = JwtHelper.GetUserFromClaims(principal)
            ?? throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ.");

        if (fromClaims.VaiTro != TenVaiTro.KhachHang)
            throw new UnauthorizedAccessException("Chỉ khách hàng mới được đặt hàng online.");

        var khachHang = await _context.KhachHangs.FindAsync(fromClaims.Id)
            ?? throw new UnauthorizedAccessException("Tài khoản khách hàng không hợp lệ.");

        if (khachHang.TrangThai != "HoatDong")
            throw new UnauthorizedAccessException("Tài khoản khách hàng không hoạt động.");

        var diaChi = dto.DiaChiGiao?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(diaChi))
            throw new InvalidOperationException("Địa chỉ giao hàng là bắt buộc.");

        var maNvLap = await GetDefaultStaffIdAsync();
        var (tongTienMon, lines) = await BuildChiTietAsync(dto.ChiTiet);
        var voucher = await _voucherService.ResolveValidVoucherAsync(dto.MaVoucher, tongTienMon);
        var tienGiam = voucher == null ? 0 : OrderPricingHelper.CalculateVoucherDiscount(voucher, tongTienMon);
        var tongThanhToan = Math.Max(0, tongTienMon + OrderPricingHelper.PhiGiaoHangMacDinh - tienGiam);
        var now = DateTime.UtcNow;

        var hoaDon = new HoaDon
        {
            LoaiDon = LoaiDon.Online,
            TrangThaiHoaDon = TrangThaiHoaDon.DaThanhToan,
            MaKH = khachHang.MaKH,
            MaNVLap = maNvLap,
            MaCa = null,
            TongTienMon = tongTienMon,
            PhiGiaoHang = OrderPricingHelper.PhiGiaoHangMacDinh,
            TienGiamGia = tienGiam,
            DiemSuDung = 0,
            TongThanhToan = tongThanhToan,
            PhuongThucThanhToan = "ChuyenKhoan",
            MaVoucher = voucher?.MaVoucher,
            ThoiGianLap = now,
            ThoiGianThanhToan = now,
        };

        await SaveHoaDonWithDetailsAsync(hoaDon, lines);

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
        await ApplyLoyaltyPointsAsync(khachHang, tongThanhToan);
        await _context.SaveChangesAsync();

        return new CreateDonHangOnlineResultDto
        {
            MaHoaDon = hoaDon.MaHoaDon,
            TrangThaiOnline = donOnline.TrangThaiOnline,
            TrangThaiHoaDon = hoaDon.TrangThaiHoaDon,
            TongThanhToan = hoaDon.TongThanhToan,
        };
    }

    public async Task<CreateDonHangOnlineResultDto> PosCheckoutAsync(ClaimsPrincipal principal, PosCheckoutDto dto)
    {
        if (principal.FindFirst("user_type")?.Value != "employee")
            throw new UnauthorizedAccessException("Chỉ nhân viên mới được thanh toán tại quầy.");

        var staff = JwtHelper.GetUserFromClaims(principal)
            ?? throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ.");

        if (staff.VaiTro != TenVaiTro.NhanVien && staff.VaiTro != TenVaiTro.QuanLy)
            throw new UnauthorizedAccessException("Không có quyền thu ngân.");

        var ca = await _context.CaLamViocs
            .Where(c => c.MaNV == staff.Id && c.TrangThaiCa == TrangThaiCaLamViec.DangMo)
            .OrderByDescending(c => c.MaCa)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Bạn chưa mở ca làm việc. Vui lòng mở ca trước khi thanh toán.");

        KhachHang? khachHang = null;
        if (!string.IsNullOrWhiteSpace(dto.SoDienThoaiKhachHang))
        {
            var phone = dto.SoDienThoaiKhachHang.Trim();
            khachHang = await _context.KhachHangs.FirstOrDefaultAsync(k => k.SoDienThoai == phone);
        }

        var (tongTienMon, lines) = await BuildChiTietAsync(dto.ChiTiet);
        var voucher = await _voucherService.ResolveValidVoucherAsync(dto.MaVoucher, tongTienMon);
        var tienGiam = voucher == null ? 0 : OrderPricingHelper.CalculateVoucherDiscount(voucher, tongTienMon);
        var tongThanhToan = Math.Max(0, tongTienMon - tienGiam);
        var payment = OrderPricingHelper.MapPaymentMethod(dto.PhuongThucThanhToan);
        var now = DateTime.UtcNow;

        decimal? tienKhachDua = dto.TienKhachDua;
        decimal? tienThua = null;
        if (payment == "TienMat" && tienKhachDua.HasValue)
            tienThua = Math.Max(0, tienKhachDua.Value - tongThanhToan);

        var hoaDon = new HoaDon
        {
            LoaiDon = LoaiDon.TaiQuay,
            TrangThaiHoaDon = TrangThaiHoaDon.HoanThanh,
            MaKH = khachHang?.MaKH,
            MaNVLap = staff.Id,
            MaCa = ca.MaCa,
            TongTienMon = tongTienMon,
            PhiGiaoHang = 0,
            TienGiamGia = tienGiam,
            DiemSuDung = 0,
            TongThanhToan = tongThanhToan,
            PhuongThucThanhToan = payment,
            TienKhachDua = tienKhachDua,
            TienThua = tienThua,
            MaVoucher = voucher?.MaVoucher,
            ThoiGianLap = now,
            ThoiGianThanhToan = now,
            GhiChu = string.IsNullOrWhiteSpace(dto.GhiChu) ? null : dto.GhiChu.Trim(),
        };

        await SaveHoaDonWithDetailsAsync(hoaDon, lines);

        if (khachHang != null)
            await ApplyLoyaltyPointsAsync(khachHang, tongThanhToan);

        await _context.SaveChangesAsync();

        return new CreateDonHangOnlineResultDto
        {
            MaHoaDon = hoaDon.MaHoaDon,
            TrangThaiHoaDon = hoaDon.TrangThaiHoaDon,
            TongThanhToan = hoaDon.TongThanhToan,
        };
    }

    public async Task<bool> UpdateStatusAsync(ClaimsPrincipal principal, int maHoaDon, string trangThaiMoi, string? lyDoHuy = null)
    {
        EnsureStaff(principal);

        var don = await _context.DonHangOnlines
            .Include(d => d.HoaDon)
            .FirstOrDefaultAsync(d => d.MaHoaDon == maHoaDon);

        if (don == null)
            return false;

        var normalized = NormalizeOnlineStatus(trangThaiMoi);
        if (!IsValidTransition(don.TrangThaiOnline, normalized))
            throw new InvalidOperationException($"Không thể chuyển từ {don.TrangThaiOnline} sang {normalized}.");

        var staff = JwtHelper.GetUserFromClaims(principal)!;
        var now = DateTime.UtcNow;

        don.TrangThaiOnline = normalized;
        if (normalized == TrangThaiDonHangOnline.DangXuLy && !don.ThoiGianXacNhan.HasValue)
        {
            don.ThoiGianXacNhan = now;
            don.MaNVXacNhan = staff.Id;
            don.HoaDon.TrangThaiHoaDon = TrangThaiHoaDon.ChoPhaChe;
        }
        else if (normalized == TrangThaiDonHangOnline.DangGiao)
        {
            don.HoaDon.TrangThaiHoaDon = TrangThaiHoaDon.ChoPhaChe;
        }
        else if (normalized == TrangThaiDonHangOnline.HoanThanh)
        {
            don.ThoiGianHoanThanh = now;
            don.HoaDon.TrangThaiHoaDon = TrangThaiHoaDon.HoanThanh;
        }
        else if (normalized == TrangThaiDonHangOnline.DaHuy)
        {
            don.LyDoHuy = lyDoHuy?.Trim() ?? "Không có lý do";
            don.HoaDon.TrangThaiHoaDon = TrangThaiHoaDon.DaHuy;
            await AddRefundSlipIfNeededAsync(don, staff.Id, don.LyDoHuy, null, null);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelAsync(ClaimsPrincipal principal, int maHoaDon, CancelOrderDto dto)
    {
        EnsureStaff(principal);
        var staff = JwtHelper.GetUserFromClaims(principal)!;

        var don = await _context.DonHangOnlines
            .Include(d => d.HoaDon)
            .FirstOrDefaultAsync(d => d.MaHoaDon == maHoaDon);

        if (don == null)
            return false;

        if (don.TrangThaiOnline is TrangThaiDonHangOnline.HoanThanh or TrangThaiDonHangOnline.DaHuy)
            throw new InvalidOperationException("Đơn hàng không thể hủy ở trạng thái hiện tại.");

        don.TrangThaiOnline = TrangThaiDonHangOnline.DaHuy;
        don.LyDoHuy = dto.LyDoHuy.Trim();
        don.HoaDon.TrangThaiHoaDon = TrangThaiHoaDon.DaHuy;
        await AddRefundSlipIfNeededAsync(don, staff.Id, dto.LyDoHuy.Trim(), dto.SoTienHoan, dto.HinhThucHoan);

        await _context.SaveChangesAsync();
        return true;
    }

    private async Task AddRefundSlipIfNeededAsync(
        DonHangOnline don,
        int maNvXuLy,
        string lyDo,
        decimal? soTienHoan,
        string? hinhThucHoan)
    {
        if (don.HoaDon.TongThanhToan <= 0)
            return;

        var alreadyRefunded = _context.PhieuHoanHuys.Local.Any(p =>
                p.MaHoaDon == don.MaHoaDon && p.HinhThucXuLy == "HuyDon")
            || await _context.PhieuHoanHuys.AnyAsync(p =>
                p.MaHoaDon == don.MaHoaDon && p.HinhThucXuLy == "HuyDon");

        if (alreadyRefunded)
            return;

        _context.PhieuHoanHuys.Add(new PhieuHoanHuy
        {
            MaHoaDon = don.MaHoaDon,
            MaNVXuLy = maNvXuLy,
            HinhThucXuLy = "HuyDon",
            LyDo = lyDo,
            SoTienHoan = soTienHoan ?? don.HoaDon.TongThanhToan,
            HinhThucHoan = hinhThucHoan ?? don.HoaDon.PhuongThucThanhToan,
            TrangThaiXuLy = "DaGhiNhan",
            ThoiGianLap = DateTime.UtcNow,
        });
    }

    private async Task<(decimal TongTienMon, List<(ChiTietHoaDon Line, List<ChiTietHoaDonTopping> Toppings)> Lines)> BuildChiTietAsync(
        List<CreateDonHangOnlineChiTietDto> chiTiet)
    {
        if (chiTiet == null || chiTiet.Count == 0)
            throw new InvalidOperationException("Giỏ hàng trống, không thể đặt hàng.");

        var sizes = await _context.Sizes
            .Where(s => s.TrangThai == "DangApDung")
            .ToDictionaryAsync(s => s.TenSize.ToUpperInvariant(), s => s);

        if (!sizes.ContainsKey("M") || !sizes.ContainsKey("L"))
            throw new InvalidOperationException("Thiếu cấu hình size M/L trong hệ thống.");

        decimal tongTienMon = 0;
        var result = new List<(ChiTietHoaDon, List<ChiTietHoaDonTopping>)>();

        foreach (var item in chiTiet)
        {
            if (item.SoLuong < 1)
                throw new InvalidOperationException("Số lượng mỗi món phải lớn hơn 0.");

            var tenSize = (item.TenSize ?? "M").Trim().ToUpperInvariant();
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

            var thanhTien = (sanPham.GiaBanGoc + size.PhuThu + toppingTotal) * item.SoLuong;
            tongTienMon += thanhTien;

            result.Add((
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

        return (tongTienMon, result);
    }

    private async Task SaveHoaDonWithDetailsAsync(
        HoaDon hoaDon,
        List<(ChiTietHoaDon Line, List<ChiTietHoaDonTopping> Toppings)> lines)
    {
        _context.HoaDons.Add(hoaDon);
        await _context.SaveChangesAsync();

        foreach (var (line, toppings) in lines)
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
    }

    private async Task ApplyLoyaltyPointsAsync(KhachHang khachHang, decimal tongThanhToan)
    {
        khachHang.DiemTichLuy += OrderPricingHelper.CalculateEarnedPoints(tongThanhToan);
        if (khachHang.DiemTichLuy >= 500)
            khachHang.HangThanhVien = "KimCuong";
        else if (khachHang.DiemTichLuy >= 300)
            khachHang.HangThanhVien = "Vang";
        else if (khachHang.DiemTichLuy >= 100)
            khachHang.HangThanhVien = "Bac";
        await Task.CompletedTask;
    }

    private async Task<int> GetDefaultStaffIdAsync()
    {
        var maNvLap = await _context.NhanViens
            .Include(n => n.VaiTro)
            .Where(n => n.TrangThai == TrangThaiNhanVien.HoatDong && n.VaiTro.TenVaiTro == TenVaiTro.QuanLy)
            .OrderBy(n => n.MaNV)
            .Select(n => n.MaNV)
            .FirstOrDefaultAsync();

        if (maNvLap == 0)
            throw new InvalidOperationException("Hệ thống chưa cấu hình nhân viên lập đơn online.");

        return maNvLap;
    }

    private static void EnsureStaff(ClaimsPrincipal principal)
    {
        if (principal.FindFirst("user_type")?.Value != "employee")
            throw new UnauthorizedAccessException("Chỉ nhân viên nội bộ mới được thực hiện.");
    }

    private static string NormalizeOnlineStatus(string status)
    {
        var s = status.Trim();
        return s switch
        {
            "CHO_XAC_NHAN" or "ChoXacNhan" => TrangThaiDonHangOnline.ChoXacNhan,
            "DANG_XU_LY" or "DangXuLy" => TrangThaiDonHangOnline.DangXuLy,
            "DANG_GIAO" or "DangGiao" => TrangThaiDonHangOnline.DangGiao,
            "HOAN_THANH" or "HoanThanh" => TrangThaiDonHangOnline.HoanThanh,
            "DA_HUY" or "DaHuy" => TrangThaiDonHangOnline.DaHuy,
            _ => s,
        };
    }

    private static bool IsValidTransition(string current, string next)
    {
        if (current == next) return true;
        return current switch
        {
            TrangThaiDonHangOnline.ChoXacNhan => next is TrangThaiDonHangOnline.DangXuLy or TrangThaiDonHangOnline.DaHuy,
            TrangThaiDonHangOnline.DangXuLy => next is TrangThaiDonHangOnline.DangGiao or TrangThaiDonHangOnline.DaHuy,
            TrangThaiDonHangOnline.DangGiao => next is TrangThaiDonHangOnline.HoanThanh or TrangThaiDonHangOnline.DaHuy,
            _ => false,
        };
    }
}
