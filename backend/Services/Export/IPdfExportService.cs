using GongDek_Nhom20.DTOs.BaoCaoDtos;
using GongDek_Nhom20.DTOs.OrderReadDtos;

namespace GongDek_Nhom20.Services.Export;

public interface IPdfExportService
{
    byte[] ExportBaoCaoDoanhThu(BaoCaoDoanhThuTongHopDto data);
    byte[] ExportHoaDon(HoaDonDetailDto hoaDon);
}
