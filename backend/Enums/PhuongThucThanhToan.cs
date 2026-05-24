namespace GongDek_Nhom20.Enums;

/// <summary>Phương thức thanh toán hóa đơn.</summary>
public static class PhuongThucThanhToan
{
    public const string TienMat = "TienMat";
    public const string ChuyenKhoan = "ChuyenKhoan";
    public const string ViDienTu = "ViDienTu";

    public static string ToLabel(string? value) => value switch
    {
        TienMat => "Tiền mặt",
        ChuyenKhoan => "Chuyển khoản",
        ViDienTu => "Ví điện tử",
        _ => value ?? "—",
    };
}
