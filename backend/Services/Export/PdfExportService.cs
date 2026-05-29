using GongDek_Nhom20.DTOs.BaoCaoDtos;
using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GongDek_Nhom20.Services.Export;

/// <summary>Xuất báo cáo ra file PDF.</summary>
public class PdfExportService : IPdfExportService
{
    static PdfExportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    #region Xuất báo cáo doanh thu PDF

    public byte[] ExportBaoCaoDoanhThu(BaoCaoDoanhThuTongHopDto data)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("GONGDEK TEA & COFFEE").Bold().FontSize(14);
                    col.Item().Text("35 Biệt Thự, Nha Trang, Khánh Hòa | 0354717914 | gongdek_nhom20@gmail.com").FontSize(9);
                    col.Item().PaddingTop(8).Text("BÁO CÁO DOANH THU").Bold().FontSize(16);
                    col.Item().PaddingTop(8).Text($"Từ ngày: {data.TuNgay:dd/MM/yyyy}  —  Đến ngày: {data.DenNgay:dd/MM/yyyy}");
                    col.Item().Text($"Ngày xuất báo cáo: {data.NgayXuat:dd/MM/yyyy HH:mm}");
                });

                page.Content().PaddingVertical(12).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(45);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("Mã HĐ").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("Thời gian").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("NV / Loại").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("Thanh toán").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("Tổng TT").Bold();
                        });

                        foreach (var item in data.ChiTiet)
                        {
                            table.Cell().Padding(4).Text(item.MaHoaDon.ToString());
                            table.Cell().Padding(4).Text(item.ThoiGianLap.ToString("dd/MM/yyyy HH:mm"));
                            table.Cell().Padding(4).Text($"{item.NhanVienLap}\n{(item.LoaiDon == LoaiDon.Online ? "Online" : "Tại quầy")}");
                            table.Cell().Padding(4).Text(PhuongThucThanhToan.ToLabel(item.PhuongThucThanhToan));
                            table.Cell().Padding(4).AlignRight().Text($"{item.TongThanhToan:N0} đ");
                        }
                    });

                    col.Item().PaddingTop(16).Column(summary =>
                    {
                        summary.Item().Text("TỔNG KẾT").Bold().FontSize(12);
                        summary.Item().Text($"Tổng số hóa đơn: {data.TongSoHoaDon}");
                        summary.Item().Text($"Tổng doanh thu: {data.TongDoanhThu:N0} đ");
                        summary.Item().Text($"Tổng tiền mặt: {data.TongTienMat:N0} đ");
                        summary.Item().Text($"Tổng chuyển khoản: {data.TongChuyenKhoan:N0} đ");
                        summary.Item().Text($"Tổng ví điện tử: {data.TongViDienTu:N0} đ");
                    });
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("GONGDEK TEA & COFFEE — 08:00–22:00 — ");
                    text.Span(DateTime.Now.ToString("dd/MM/yyyy"));
                });
            });
        });

        return document.GeneratePdf();
    }

    #endregion

    #region Xuất hóa đơn PDF

    public byte[] ExportHoaDon(HoaDonDetailDto hoaDon)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A5);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("GONGDEK TEA & COFFEE").Bold().FontSize(14);
                    col.Item().Text("35 Biệt Thự, Nha Trang, Khánh Hòa | 0354717914").FontSize(9);
                    col.Item().PaddingTop(6).Text($"HÓA ĐƠN #{hoaDon.MaHoaDon}").Bold().FontSize(13);
                    col.Item().Text($"Ngày: {hoaDon.ThoiGianLap:dd/MM/yyyy HH:mm}");
                    col.Item().Text($"NV: {hoaDon.TenNhanVienLap} | {(hoaDon.LoaiDon == LoaiDon.Online ? "Online" : "Tại quầy")}");
                });

                page.Content().PaddingVertical(10).Column(col =>
                {
                    col.Item().Text($"Khách: {hoaDon.TenKhachHang ?? "Khách lẻ"}");
                    if (!string.IsNullOrWhiteSpace(hoaDon.SoDienThoaiKhach))
                        col.Item().Text($"SĐT: {hoaDon.SoDienThoaiKhach}");

                    col.Item().PaddingTop(8).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3);
                            c.ConstantColumn(30);
                            c.ConstantColumn(60);
                        });

                        table.Header(h =>
                        {
                            h.Cell().Text("Món").Bold();
                            h.Cell().Text("SL").Bold();
                            h.Cell().AlignRight().Text("Tiền").Bold();
                        });

                        foreach (var line in hoaDon.ChiTiet)
                        {
                            var toppingText = line.Toppings.Count > 0
                                ? " + " + string.Join(", ", line.Toppings.Select(t => t.TenTopping))
                                : "";
                            table.Cell().Text($"{line.TenSanPham} ({line.TenSize}){toppingText}");
                            table.Cell().Text(line.SoLuong.ToString());
                            table.Cell().AlignRight().Text($"{line.ThanhTien:N0}");
                        }
                    });

                    col.Item().PaddingTop(10).Column(sum =>
                    {
                        sum.Item().Text($"Tổng món: {hoaDon.TongTienMon:N0} đ");
                        if (hoaDon.PhiGiaoHang > 0)
                            sum.Item().Text($"Phí giao: {hoaDon.PhiGiaoHang:N0} đ");
                        if (hoaDon.TienGiamGia > 0)
                            sum.Item().Text($"Giảm giá: -{hoaDon.TienGiamGia:N0} đ");
                        sum.Item().Text($"THÀNH TIỀN: {hoaDon.TongThanhToan:N0} đ").Bold();
                        sum.Item().Text($"Thanh toán: {PhuongThucThanhToan.ToLabel(hoaDon.PhuongThucThanhToan)}");
                    });
                });

                page.Footer().AlignCenter().Text("Cảm ơn quý khách! Hẹn gặp lại tại GongDek.");
            });
        });

        return document.GeneratePdf();
    }

    #endregion
}
