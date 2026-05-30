using System.Security.Claims;
using GongDek_Nhom20.DTOs.Auth;

namespace GongDek_Nhom20.Helpers;

public static class CurrentUserExtensions
{
    public static UserProfileDto? GetCurrentUser(this ClaimsPrincipal principal)
        => JwtHelper.GetUserFromClaims(principal);

    public static bool IsQuanLy(this ClaimsPrincipal principal)
    {
        var user = principal.GetCurrentUser();
        return user?.VaiTro == "QuanLy";
    }

    public static int GetStaffId(this ClaimsPrincipal principal)
    {
        var user = principal.GetCurrentUser()
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng.");
        if (user.VaiTro is not ("QuanLy" or "NhanVien"))
            throw new UnauthorizedAccessException("Chỉ nhân viên nội bộ mới được thực hiện thao tác này.");
        return user.Id;
    }

    public static int GetCustomerId(this ClaimsPrincipal principal)
    {
        var user = principal.GetCurrentUser()
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng.");
        if (user.VaiTro != "KhachHang")
            throw new UnauthorizedAccessException("Chỉ khách hàng mới được truy cập tài nguyên này.");
        return user.Id;
    }
}
