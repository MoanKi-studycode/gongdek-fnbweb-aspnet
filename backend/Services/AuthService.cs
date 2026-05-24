using System.Security.Claims;
using GongDek_Nhom20.Data;
using GongDek_Nhom20.DTOs.Auth;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Services;

/// <summary>Xử lý đăng nhập, đăng ký khách hàng và lấy thông tin phiên.</summary>
public class AuthService : IAuthService
{
    private readonly GongDekDbContext _context;
    private readonly JwtHelper _jwtHelper;

    public AuthService(GongDekDbContext context, JwtHelper jwtHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
    }

    #region Xử lý đăng nhập hệ thống

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        if (!PasswordHashHelper.IsPasswordStrongEnough(dto.MatKhau))
            throw new InvalidOperationException("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.");

        // Đăng nhập nhân viên qua tên đăng nhập
        if (!string.IsNullOrWhiteSpace(dto.TenDangNhap))
            return await LoginEmployeeAsync(dto.TenDangNhap.Trim(), dto.MatKhau);

        // Đăng nhập khách hàng qua email
        if (!string.IsNullOrWhiteSpace(dto.Email))
            return await LoginCustomerAsync(dto.Email.Trim(), dto.MatKhau);

        throw new InvalidOperationException("Vui lòng nhập tên đăng nhập hoặc email.");
    }

    private async Task<LoginResponseDto> LoginEmployeeAsync(string tenDangNhap, string matKhau)
    {
        var nhanVien = await _context.NhanViens
            .Include(n => n.VaiTro)
            .FirstOrDefaultAsync(n => n.TenDangNhap == tenDangNhap);

        if (nhanVien == null)
            throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng.");

        if (nhanVien.TrangThai == TrangThaiNhanVien.Khoa)
            throw new UnauthorizedAccessException("Tài khoản đã bị khóa. Liên hệ quản lý.");

        if (!PasswordHashHelper.VerifyPassword(matKhau, nhanVien.MatKhauHash))
            throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng.");

        var profile = new UserProfileDto
        {
            Id = nhanVien.MaNV,
            HoTen = nhanVien.HoTen,
            VaiTro = nhanVien.VaiTro.TenVaiTro,
            TenDangNhap = nhanVien.TenDangNhap,
        };

        return BuildLoginResponse(profile, "employee");
    }

    private async Task<LoginResponseDto> LoginCustomerAsync(string email, string matKhau)
    {
        var khachHang = await _context.KhachHangs
            .FirstOrDefaultAsync(k => k.Email == email);

        if (khachHang == null)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (khachHang.TrangThai != "HoatDong")
            throw new UnauthorizedAccessException("Tài khoản không hoạt động.");

        if (!PasswordHashHelper.VerifyPassword(matKhau, khachHang.MatKhauHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        var profile = new UserProfileDto
        {
            Id = khachHang.MaKH,
            HoTen = khachHang.HoTen,
            VaiTro = TenVaiTro.KhachHang,
            Email = khachHang.Email,
        };

        return BuildLoginResponse(profile, "customer");
    }

    private LoginResponseDto BuildLoginResponse(UserProfileDto profile, string userType)
    {
        return new LoginResponseDto
        {
            Token = _jwtHelper.GenerateToken(profile, userType),
            User = profile,
        };
    }

    #endregion

    #region Đăng ký khách hàng

    public async Task<LoginResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto)
    {
        if (!PasswordHashHelper.IsPasswordStrongEnough(dto.MatKhau))
            throw new InvalidOperationException("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.");

        if (await _context.KhachHangs.AnyAsync(k => k.Email == dto.Email))
            throw new InvalidOperationException("Email đã được sử dụng.");

        if (await _context.KhachHangs.AnyAsync(k => k.SoDienThoai == dto.SoDienThoai))
            throw new InvalidOperationException("Số điện thoại đã được sử dụng.");

        var khachHang = new KhachHang
        {
            HoTen = dto.HoTen,
            Email = dto.Email,
            SoDienThoai = dto.SoDienThoai,
            MatKhauHash = PasswordHashHelper.HashPassword(dto.MatKhau),
            NgayDangKy = DateTime.UtcNow,
        };

        _context.KhachHangs.Add(khachHang);
        await _context.SaveChangesAsync();

        var profile = new UserProfileDto
        {
            Id = khachHang.MaKH,
            HoTen = khachHang.HoTen,
            VaiTro = TenVaiTro.KhachHang,
            Email = khachHang.Email,
        };

        return BuildLoginResponse(profile, "customer");
    }

    #endregion

    #region Lấy thông tin phiên đăng nhập

    public async Task<UserProfileDto?> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        var fromClaims = JwtHelper.GetUserFromClaims(principal);
        if (fromClaims == null)
            return null;

        var userType = principal.FindFirst("user_type")?.Value;

        if (userType == "employee")
        {
            var nv = await _context.NhanViens
                .Include(n => n.VaiTro)
                .FirstOrDefaultAsync(n => n.MaNV == fromClaims.Id);

            if (nv == null || nv.TrangThai == TrangThaiNhanVien.Khoa)
                return null;

            return new UserProfileDto
            {
                Id = nv.MaNV,
                HoTen = nv.HoTen,
                VaiTro = nv.VaiTro.TenVaiTro,
                TenDangNhap = nv.TenDangNhap,
            };
        }

        if (userType == "customer")
        {
            var kh = await _context.KhachHangs.FindAsync(fromClaims.Id);
            if (kh == null || kh.TrangThai != "HoatDong")
                return null;

            return new UserProfileDto
            {
                Id = kh.MaKH,
                HoTen = kh.HoTen,
                VaiTro = TenVaiTro.KhachHang,
                Email = kh.Email,
            };
        }

        return null;
    }

    #endregion
}
