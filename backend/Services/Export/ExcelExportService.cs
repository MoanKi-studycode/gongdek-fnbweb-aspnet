using ClosedXML.Excel;
using GongDek_Nhom20.DTOs.BaoCaoDtos;
using GongDek_Nhom20.Enums;

namespace GongDek_Nhom20.Services.Export;

/// <summary>Xuất báo cáo ra file Excel (.xlsx).</summary>
public class ExcelExportService : IExcelExportService
{
    #region Xuất báo cáo doanh thu Excel

    public byte[] ExportBaoCaoDoanhThu(BaoCaoDoanhThuTongHopDto data)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("BaoCaoDoanhThu");

        ws.Cell(1, 1).Value = "GONGDEK TEA & COFFEE";
        ws.Range(1, 1, 1, 12).Merge().Style.Font.SetBold().Font.SetFontSize(14);
        ws.Cell(2, 1).Value = "35 Biệt Thự, Nha Trang, Khánh Hòa | 0354717914 | gongdek_nhom20@gmail.com | 08:00–22:00";
        ws.Range(2, 1, 2, 12).Merge();

        ws.Cell(4, 1).Value = "BÁO CÁO DOANH THU";
        ws.Range(4, 1, 4, 12).Merge().Style.Font.SetBold().Font.SetFontSize(12);

        ws.Cell(6, 1).Value = "Từ ngày:";
        ws.Cell(6, 2).Value = data.TuNgay.ToString("dd/MM/yyyy");
        ws.Cell(7, 1).Value = "Đến ngày:";
        ws.Cell(7, 2).Value = data.DenNgay.ToString("dd/MM/yyyy");
        ws.Cell(8, 1).Value = "Ngày xuất báo cáo:";
        ws.Cell(8, 2).Value = data.NgayXuat.ToString("dd/MM/yyyy HH:mm");

        var headerRow = 10;
        var headers = new[]
        {
            "STT", "Mã HĐ", "Thời gian lập", "NV lập", "Loại đơn",
            "Thanh toán", "Trạng thái", "Tổng món", "Giảm giá", "Phí ship", "Tổng TT",
        };

        for (var i = 0; i < headers.Length; i++)
        {
            ws.Cell(headerRow, i + 1).Value = headers[i];
            ws.Cell(headerRow, i + 1).Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.LightGray);
        }

        var row = headerRow + 1;
        var stt = 1;
        foreach (var item in data.ChiTiet)
        {
            ws.Cell(row, 1).Value = stt++;
            ws.Cell(row, 2).Value = item.MaHoaDon;
            ws.Cell(row, 3).Value = item.ThoiGianLap.ToString("dd/MM/yyyy HH:mm");
            ws.Cell(row, 4).Value = item.NhanVienLap;
            ws.Cell(row, 5).Value = item.LoaiDon == LoaiDon.Online ? "Online" : "Tại quầy";
            ws.Cell(row, 6).Value = PhuongThucThanhToan.ToLabel(item.PhuongThucThanhToan);
            ws.Cell(row, 7).Value = "Hoàn thành";
            ws.Cell(row, 8).Value = item.TongTienMon;
            ws.Cell(row, 9).Value = item.TienGiamGia;
            ws.Cell(row, 10).Value = item.PhiGiaoHang;
            ws.Cell(row, 11).Value = item.TongThanhToan;
            row++;
        }

        var summaryRow = row + 1;
        ws.Cell(summaryRow, 1).Value = "TỔNG KẾT";
        ws.Cell(summaryRow, 1).Style.Font.SetBold();
        ws.Cell(summaryRow + 1, 1).Value = "Tổng số hóa đơn:";
        ws.Cell(summaryRow + 1, 2).Value = data.TongSoHoaDon;
        ws.Cell(summaryRow + 2, 1).Value = "Tổng doanh thu:";
        ws.Cell(summaryRow + 2, 2).Value = data.TongDoanhThu;
        ws.Cell(summaryRow + 3, 1).Value = "Tổng tiền mặt:";
        ws.Cell(summaryRow + 3, 2).Value = data.TongTienMat;
        ws.Cell(summaryRow + 4, 1).Value = "Tổng chuyển khoản:";
        ws.Cell(summaryRow + 4, 2).Value = data.TongChuyenKhoan;
        ws.Cell(summaryRow + 5, 1).Value = "Tổng ví điện tử:";
        ws.Cell(summaryRow + 5, 2).Value = data.TongViDienTu;

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    #endregion
}
