namespace GongDek_Nhom20.Enums;

public static class TrangThaiNhanVien
{
    public const string HoatDong = "HoatDong";
    public const string Khoa = "Khoa";
}

public static class TenVaiTro
{
    public const string QuanLy = "QuanLy";
    public const string NhanVien = "NhanVien";
    public const string KhachHang = "KhachHang";
}

public static class TrangThaiHoaDon
{
    public const string ChoThanhToan = "ChoThanhToan";
    public const string DaThanhToan = "DaThanhToan";
    public const string ChoPhaChe = "ChoPhaChe";
    public const string HoanThanh = "HoanThanh";
    public const string DaHuy = "DaHuy";
}

public static class TrangThaiCaLamViec
{
    public const string DangMo = "DangMo";
    public const string DaDong = "DaDong";
}

public static class TrangThaiKhungCa
{
    public const string HoatDong = "HoatDong";
    public const string NgungApDung = "NgungApDung";
}

public static class LoaiDon
{
    public const string TaiQuay = "TaiQuay";
    public const string Online = "Online";
}

public static class TrangThaiDonHangOnline
{
    public const string ChoXacNhan = "ChoXacNhan";
    public const string DangXuLy = "DangXuLy";
    public const string DangGiao = "DangGiao";
    public const string HoanThanh = "HoanThanh";
    public const string DaHuy = "DaHuy";
}

public static class TrangThaiHoaDonDaThanhToan
{
    public static readonly string[] Values =
    {
        TrangThaiHoaDon.DaThanhToan,
        TrangThaiHoaDon.ChoPhaChe,
        TrangThaiHoaDon.HoanThanh,
    };
}
