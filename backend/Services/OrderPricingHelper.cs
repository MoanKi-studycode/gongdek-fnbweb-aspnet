using GongDek_Nhom20.Models;

namespace GongDek_Nhom20.Services;

internal static class OrderPricingHelper
{
    public const decimal PhiGiaoHangMacDinh = 15000m;

    public static bool IsPercentVoucher(Voucher voucher)
    {
        if (voucher.MoTa != null && voucher.MoTa.Contains("PHAN_TRAM", StringComparison.OrdinalIgnoreCase))
            return true;
        if (voucher.MoTa != null && voucher.MoTa.Contains("SO_TIEN", StringComparison.OrdinalIgnoreCase))
            return false;
        return voucher.GiaTriGiam > 0 && voucher.GiaTriGiam <= 100;
    }

    public static decimal CalculateVoucherDiscount(Voucher voucher, decimal tongTienMon)
    {
        if (voucher.DonHangToiThieu.HasValue && tongTienMon < voucher.DonHangToiThieu.Value)
            return 0;

        decimal discount;
        if (IsPercentVoucher(voucher))
        {
            discount = Math.Round(tongTienMon * voucher.GiaTriGiam / 100m, 0);
            var max = ParseMaxDiscount(voucher.MoTa);
            if (max.HasValue)
                discount = Math.Min(discount, max.Value);
        }
        else
        {
            discount = voucher.GiaTriGiam;
        }

        return Math.Min(discount, tongTienMon);
    }

    private static decimal? ParseMaxDiscount(string? moTa)
    {
        if (string.IsNullOrWhiteSpace(moTa)) return null;
        const string prefix = "GIAM_TOI_DA:";
        var idx = moTa.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        var part = moTa[(idx + prefix.Length)..].Split(';', ',')[0].Trim();
        return decimal.TryParse(part, out var val) ? val : null;
    }

    public static int CalculateEarnedPoints(decimal tongThanhToan) =>
        (int)Math.Floor(tongThanhToan / 10000m);

    public static string MapPaymentMethod(string? value) => value switch
    {
        "cash" or "TienMat" => "TienMat",
        "transfer" or "ChuyenKhoan" => "ChuyenKhoan",
        "ewallet" or "ViDienTu" => "ViDienTu",
        _ => "TienMat",
    };
}
